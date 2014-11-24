ModuleSystem
============

Dynamic Loading of Javascript based on DOM elements


To do for 1.1
-------------
- [x] remove jQuery dependencie
- [x] simplify EventBus

How To Use
----------
###Parts
Utility functions like z.B AJAX loader etc.
####Creation and registration
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
####Configure
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
####Dependencie Injection
parts could be composed of other parts
```js
moduleSystem.createPart("calculator")
    .dependencies(["adder", "multiplier"])
    .creator(function(adder, multiplier) {
 
        return {
            add : adder.add,
            multiply : multiplier.multiply
        };
    });
```
###Module
####Creation and registration
```js
moduleSystem.createModule("helloWorld")
    .creator(function(moduleObj) {
        alert("Hello " + moduleObj.innerHTML;
    });
```
this module gets loaded when a DOM-element with attribute modules="helloWorld" is found. The found DOM-Node is then given to the Module as the first parameter
```html
<div modules="helloWorld">World</div> // alerts Hello World
```
Incase more than one DOM-Node with the same module is found more than one module-object are initialized
```html
<div modules="helloWorld">World1</div> //alerts Hello World1
<div modules="helloWorld">World2</div> //alerts Hello World2
```
####Configure
like parts modules could be provisioned with settings
```js
moduleSystem.createModule("staticHelloWorld")
    .settings({staticText : "World"})
    .creator(function(moduleObj, settings) {
        alert("Hello " + settings.staticText;
    });
```
```html
<div modules="staticHelloWorld" /> //alerts Hello World
```
#####Override from DOM
an additional setting which overrides the default settings object could be provided via DOM
```html
<div modules="staticHelloWorld"> //alerts Hello Module
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
moduleSystem.createModule("staticHelloWorldWithDependencies")
    .settings({staticText : "World"})
    .dependencies(["adder"])
    .creator(function(moduleObj, settings, adder) {
        alert("Hello " + settings.staticText + " " + adder.add(1,2);
    });
```
```html
<div modules="staticHelloWorldWithDependencies" /> //alerts Hello World 3
```
####PostConstruct Hook
every module could decide to publish a postConstruct method which gets executed after every module is properly initialized.
This should be used if a event could be resulting from the actions in place. Because if an event is published before all modules are initialized, a listening module could not listening to the EventBus already and miss the event. 
```js
moduleSystem.createModule("helloWorldPublisher")
    .dependencie(["eventBus"])
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
<div modules="helloWorldPublisher" /> //publish hello world changed
```
####Communication between modules
modules should communicate over the EventBus to prevent tight coupling. 
For this every module is added to the EventBus automatically. For this a public method have to be exposed with a name like: on + EventName (eg. onHelloWorldChanged)
```js
moduleSystem.createModule("helloWorldPublisher")
    .dependencie(["eventBus"])
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

moduleSystem.createModule("helloWorldListener")
    .creator(function(moduleObj) {
        function onHelloWorldChanged(event) {
            alert("Hello " + event.text);
        }
         
        return {
            onHelloWorldChanged: onHelloWorldChanged // gets called if a HelloWorldChanged event gets published
        }
    });
    
moduleSystem.createModule("unnamedEventListener")
    .creator(function(moduleObj) {
        function onEvent(event) {
            if(name === 'HelloWorldChanged')
               alert("Hello " + event.text);
            else {
               alert("Hello " + event.data);
            }
        }
         
        return {
            onEvent: onEvent // gets called by every named event and events without names
        }
    });
```
```html
<div modules="helloWorldListener" /> // alerts Hello World if helloWorldPublisher is in place
```
####More than one Module per DOM-Element
sometimes it is useful to handle a dom element with more than one js-module. For this it is possible to load more than one module with a comma separated list
```html
<div modules="moduleToLoad1,otherModuleToLoad" /> // loads two modules with the same moduleObj
```
###Start Provisioning
when every module is registered in the module system initModulePage() should be called. This would typically be done on DOM ready
```js
$(function() {
    moduleSystem.initModulePage();
});
```
