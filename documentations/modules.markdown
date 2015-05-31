---
layout: default
---
###Modules
####Creation and registration
```js
mom.createModule('hello-world')
    .creator(function(moduleObj) {
        alert('Hello ' + moduleObj.innerHTML;
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
mom.createModule('static-hello-world')
    .settings({staticText : 'World'})
    .creator(function(moduleObj, settings) {
        alert('Hello ' + settings.staticText;
    });
```
```html
<div modules="static-hello-world" /> //alerts Hello World
```
#####Override from DOM
an additional setting which merges/overrides the default settings object could be provided via DOM
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
mom.createModule('static-hello-world-with-dependencies')
    .settings({staticText : 'World'})
    .dependencies(['adder'])
    .creator(function(moduleObj, settings, adder) {
        alert('Hello ' + settings.staticText + ' ' + adder.add(1,2);
    });
```
```html
<div modules="static-hello-world-with-dependencies" /> //alerts Hello World 3
```
####PostConstruct Hook
every module could decide to publish a postConstruct method which gets executed after every module is properly initialized.
This should be used if a event could be resulting from the actions in place. Because if an event is published before all modules are initialized, a listening module could not listening to the EventBus already and miss the event. 
```js
mom.createModule('hello-world-publisher')
    .dependencies(['event-bus'])
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
mom.createModule('hello-world-publisher')
    .dependencie(['event-bus'])
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

mom.createModule('hello-world-listener')
    .creator(function(moduleObj) {
        function onHelloWorldChanged(event) {
            alert('Hello ' + event.text);
        }
         
        return {
            onHelloWorldChanged: onHelloWorldChanged // gets called if a HelloWorldChanged event gets published
        }
    });
    
mom.createModule('unnamed-event-listener')
    .creator(function(moduleObj) {
        function onEvent(event) {
            if(name === 'HelloWorldChanged') {
               alert('Hello ' + event.text);
            } else {
               alert('Hello ' + event.data);
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
    mom.initModulePage();
});
```
