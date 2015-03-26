ModuleSystem
============

Dynamic Loading of Javascript based on DOM elements. 
Especially usefull for Content Management Systems (CMS):
   - where you don't know which javascript needs to be loaded on which page
   - where you want to configure javascript on render time from the CMS
   - where you want to loosely couple modules, because you don't now if the other module is even on the page 

Breaking changes
----------------
#### 1.1 -> 1.2
#####Scopes. 
By default the module system creates a new instance each time it suplies a part.
In 1.1 parts where singletons (created once and reused). 

If logic relies on that behaviour, then these parts should be scoped singleton
```js
moduleSystem.createPart("singleton-part")
    .scope('singleton')
    .creator(function() {
        ...
    });
    
//or change the default behaviour
moduleSystem.initModuleSystem({
   defaultScope : 'singleton'
});
```
#### 1.2 -> 1.3
The 'eventBus' part is now called 'event-bus'. Access to the 'eventBus' part will print deprecated logs.



How To Use
----------
###Parts
Utility functions like z.B AJAX loader etc.
####Creation and registration

####Creator Parts
```js
moduleSystem.createPart("adder")
    .creator(function() {
        function privateMethod(x ,y) {
            return x + y;
        }
 
        function publicMethod(x, y) {
            return privateMethod(x, y);
        }
 
        return {
            add : publicMethod
        };
    });
```
#####Scopes
By default the module system creates a new instance each time it suplies a part.
To change this behaviour a scope could be specified
######Lazy Singleton
```js
moduleSystem.createPart("singleton-part")
    .scope('lazy-singleton')
    .creator(function() {
        ...
    });
```
Or the default behaviour could be changed
```js
moduleSystem.initModuleSystem({
   defaultScope : 'lazy-singleton'
});
```
A lazy singleton part gets created on the first request and is reused on following requests.

######Eager Singleton
```js
moduleSystem.createPart("singleton-part")
    .scope('eager-singleton')
    .creator(function() {
        ...
    });
```
A eager singleton part gets created every time initModulePage() is called, even when no module/part has it as an depedency.
There is only one intance of this module which gets reused.

#####Configure
```js
moduleSystem.createPart("adder")
    .settings({
        isDebug : true;
    })
    .creator(function (settings) {
        function privateMethod(x ,y) {
            if(settings.isDebug) {
                console.log("x: " + x + " y: " + y);
            }
            return x + y;
        }
  
        function publicMethod(x, y) {
            return privateMethod(x, y);
        }
  
        return {
            add : publicMethod
        };
    });
```
#####Dependency Injection
creator parts could be composed of other parts
```js
moduleSystem.createPart("calculator")
    .dependencies(["adder", "multiplier", "static-part"])
    .creator(function(adder, multiplier, staticPart) {
        console.log(staticPart.static);
 
        return {
            add : adder.add,
            multiply : multiplier.multiply
        };
    });
```
####Returns Parts
If a part don't need a constructor function to be called (e.g. has no dependencies, settings, etc), a returns part could be used
```js
moduleSystem.createPart("static-part")
    .returns({
         static : "static"
    });
```

###Module
####Creation and registration
```js
moduleSystem.createModule("hello-world")
    .creator(function(moduleObj) {
        alert("Hello " + moduleObj.innerHTML;
    });
```
this module gets loaded when a DOM-element with attribute modules="helloWorld" is found. The found DOM-Node is then given to the Module as the first parameter
```html
<div modules="hello-world">World</div> // alerts Hello World
```
Incase more than one DOM-Node with the same module is found more than one module-object are initialized
```html
<div modules="hello-world">World1</div> //alerts Hello World1
<div modules="hello-world">World2</div> //alerts Hello World2
```
####Configure
like parts modules could be provisioned with settings
```js
moduleSystem.createModule("static-hello-world")
    .settings({staticText : "World"})
    .creator(function(moduleObj, settings) {
        alert("Hello " + settings.staticText;
    });
```
```html
<div modules="static-hello-world" /> //alerts Hello World
```
#####Override from DOM
an additional setting which overrides the default settings object could be provided via DOM
```html
<div modules="static-hello-world"> //alerts Hello Module
  <script type="staticHelloWorld/settings"> 
    {
      "staticText" : "Module"
    }
  </script>
</div>
```
####Dependencie Injection
modules could be composed out of parts.
It's a design decision to not allow modules to be injected in other modules. Use the EventBus for communication between modules.
```js
moduleSystem.createModule("static-hello-world-with-dependencies")
    .settings({staticText : "World"})
    .dependencies(["adder"])
    .creator(function(moduleObj, settings, adder) {
        alert("Hello " + settings.staticText + " " + adder.add(1,2);
    });
```
```html
<div modules="static-hello-world-with-dependencies" /> //alerts Hello World 3
```
####PostConstruct Hook
every module could decide to publish a postConstruct method which gets executed after every module is properly initialized.
This should be used if a event could be resulting from the actions in place. Because if an event is published before all modules are initialized, a listening module could not listening to the EventBus already and miss the event. 
```js
moduleSystem.createModule("hello-world-publisher")
    .dependencies(["event-bus"])
    .creator(function(moduleObj, eventBus) {
        function postConstruct() {
        
            var event = {
                name = 'HelloWorldChanged',
                text = moduleObj.innerHTML
            };
            
            eventBus.publish(event);
        }
         
        return {
            postConstruct : postConstruct
        }
    });
```
```html
<div modules="hello-world-publisher" /> //publish hello world changed
```
####Communication between modules
modules should communicate over the EventBus to prevent tight coupling. 
For this every module is added to the EventBus automatically. For this a public method have to be exposed with a name like: on + EventName (eg. onHelloWorldChanged)
```js
moduleSystem.createModule("hello-world-publisher")
    .dependencie(["event-bus"])
    .creator(function(moduleObj, eventBus) {
        function postConstruct() {
        
            var namedEvent = {
                name : 'HelloWorldChanged',
                text : moduleObj.innerHTML
            };
            
            eventBus.publish(namedEvent);
            
            var event = {
               data : 'testData'
            };
            
            eventBus.publis(event)
        }
         
        return {
            postConstruct : postConstruct
        }
    });

moduleSystem.createModule("hello-world-listener")
    .creator(function(moduleObj) {
        function onHelloWorldChanged(event) {
            alert("Hello " + event.text);
        }
         
        return {
            onHelloWorldChanged: onHelloWorldChanged // gets called if a HelloWorldChanged event gets published
        }
    });
    
moduleSystem.createModule("unnamed-event-listener")
    .creator(function(moduleObj) {
        function onEvent(event) {
            if(name === 'HelloWorldChanged') {
               alert("Hello " + event.text);
            } else {
               alert("Hello " + event.data);
            }
        }
         
        return {
            onEvent: onEvent // gets called by every named event and events without names
        }
    });
```
```html
<div modules="hello-world-listener" /> // alerts Hello World if helloWorldPublisher is in place
```
####More than one Module per DOM-Element
sometimes it is useful to handle a dom element with more than one js-module. For this it is possible to load more than one module with a comma separated list
```html
<div modules="module-to-load1,other-module-to-load" /> // loads two modules with the same moduleObj
```
###Start Provisioning
when every module is registered in the module system initModulePage() should be called. This would typically be done on DOM ready
```js
$(function() {
    moduleSystem.initModulePage();
});
```
To do for 1.3
-------------
- [x] initialize module system only on parts of the dom
- [x] embrace module names with '-' instead of CamelCase
- [x] better wrong formated settings json exception
- [x] module/part builder sanity checks
- [ ] provision single dom node
- [ ] provide a method for dynamic loading and unloading of modules
- [ ] merge part settings with settings provided from initialization
- [ ] clean up tests
- [ ] exception handling in module/part construction  

To do future releases
-------------
- [ ] add plugin concept for spezialized modules and parts
- [ ] configurable async loading of modules and part
- [ ] debug module access with console
