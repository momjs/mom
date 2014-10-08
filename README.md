ModuleSystem
============

Dynamic Loading of Javascript based on DOM elements

To do for 1.0
-------------
- [x] only expose moduleSystem global variable 
- [x] documentation
- [ ] add to bower
- [ ] add configurable one or multiple modules per dom Element

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
    .creator(function($moduleObj) {
        alert("Hello " + $moduleObj.data("text");
    });
```
this module gets loaded when a DOM-element with attribute data-module="helloWorld" is found. The found DOM-Node is then given to the Module as the first parameter
```html
<div data-module="helloWorld" data-text="World"/> // alerts Hello World
```
Incase more than one DOM-Node with the same module is found more than one module-object are initialized
```html
<div data-module="helloWorld" data-text="World1"/> //alerts Hello World1
<div data-module="helloWorld" data-text="World2"/> //alerts Hello World2
```
####Configure
like parts modules could be provisioned with settings
```js
moduleSystem.createModule("staticHelloWorld")
    .settings({staticText : "World"})
    .creator(function($moduleObj, settings) {
        alert("Hello " + settings.staticText;
    });
```
```html
<div data-module="staticHelloWorld" /> //alerts Hello World
```
#####Override from DOM
an additional setting which overrides the default settings object could be provided via DOM
```html
<div data-module="staticHelloWorld"> //alerts Hello Module
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
    .creator(function($moduleObj, settings, adder) {
        alert("Hello " + settings.staticText + " " + adder.add(1,2);
    });
```
```html
<div data-module="staticHelloWorldWithDependencies" /> //alerts Hello World 3
```
####PostConstruct Hook
every module could decide to publish a postConstruct method which gets executed after every module is properly initialized.
This should be used if a event could be resulting from the actions in place. Because if an event is published before all modules are initialized, a listening module could'be not listening to the EventBus already and miss the event. 
```js
moduleSystem.createModule("helloWorldPublisher")
    .dependencie(["eventBus"])
    .creator(function($moduleObj, eventBus) {
        function postConstruct() {
            eventBus.publish(new eventBus.Events.HelloWorldChanged($moduleObj.data("text"));
        }
         
        return {
            postConstruct : postConstruct
        }
    });
```
```html
<div data-module="helloWorldPublisher" /> //publish hello world changed
```
####Communication between modules
modules should communicate over the EventBus to prevent tight coupling. 
For this every module is added to the EventBus automatically. For this a public method have to be exposed with a name like: on + EventName (eg. onHelloWorldChanged)
```js
moduleSystem.createModule("helloWorldListener")
    .creator(function($moduleObj) {
        function onHelloWorldChanged(event) {
            alert("Hello " + event.text);
        }
         
        return {
            onHelloWorldChanged: onHelloWorldChanged // gets called if a HelloWorldChanged event gets published
        }
    });
```
```html
<div data-module="helloWorldListener" /> // alerts Hello World if helloWorldPublisher is in place
```
####More than one Module per DOM-Element
sometimes it is useful to handle a dom element with more than one js-module. For this it is possible to load more than one module with a comma separated list
```html
<div data-module="moduleToLoad1,otherModuleToLoad" /> // loads two modules with the same $moduleObj
```
###Start Provisioning
when every module is registered in the module system initModulePage() should be called. This would typically be done on DOM ready
```js
$(function() {
    moduleSystem.initModulePage();
});
```
