mom - the module manager
============
Dynamic Loading of Javascript based on DOM elements.
Especially usefull for Content Management Systems (CMS):
   - where you don't know which javascript needs to be loaded on which page
   - where you want to configure javascript during rendering
   - where you want to loosely couple modules, because you don't now if the other module is even on the page

###Examples
- [Weather](http://momjs.github.io/mom/examples/weather/)
- [ToDo](http://momjs.github.io/mom/examples/todo/)

####Status
|Master|Develop|
|------|-------|
|[![Build Status](https://travis-ci.org/momjs/mom.svg?branch=master)](https://travis-ci.org/momjs/mom)|[![Build Status](https://travis-ci.org/momjs/mom.svg?branch=develop)](https://travis-ci.org/momjs/mom)|
|[![Coverage Status](https://coveralls.io/repos/momjs/mom/badge.svg?branch=master)](https://coveralls.io/r/momjs/mom?branch=master)|[![Coverage Status](https://coveralls.io/repos/momjs/mom/badge.svg?branch=develop)](https://coveralls.io/r/momjs/mom?branch=develop)|
|[![Sauce Test Status](https://saucelabs.com/browser-matrix/momjs_master.svg)](https://saucelabs.com/u/momjs_master)|[![Sauce Test Status](https://saucelabs.com/browser-matrix/momjs.svg)](https://saucelabs.com/u/momjs)|

[![Dev Dependencies](https://david-dm.org/momjs/mom/dev-status.svg)](https://david-dm.org/momjs/mom#info=devDependencies)

How To Use
----------
###Parts
Utility functions like z.B AJAX loader etc.
####Creation and registration

####Creator Parts
```js
mom.createPart('adder')
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
mom.createPart('singleton-part')
    .scope('lazy-singleton')
    .creator(function() {
        ...
    });
```
Or the default behaviour could be changed
```js
mom.initModulePage({
   defaultScope : 'lazy-singleton'
});
```
A lazy singleton part gets created on the first request and is reused on following requests.

######Eager Singleton
```js
mom.createPart('singleton-part')
    .scope('eager-singleton')
    .creator(function() {
        ...
    });
```
A eager singleton part gets created every time initModulePage() is called, even when no module/part has it as an depedency.
There is only one intance of this module which gets reused.

#####Configure
```js
mom.createPart('adder')
    .settings({
        isDebug : true;
    })
    .creator(function (settings) {
        function privateMethod(x ,y) {
            if(settings.isDebug) {
                console.log('x: ' + x + ' y: ' + y);
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

####Override from DOM
an additional setting which merges/overrides with the default settings object could be provided via DOM.
The configuration has to be put in the html head
```html
<html>
<head>
   <script type="adder/settings">
   {
      "isDebug": false
   }
   </script>
</head>
</html>
```

#####Dependency Injection
creator parts could be composed of other parts
```js
mom.createPart('calculator')
    .dependencies(['adder', 'multiplier', 'static-part'])
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
mom.createPart('static-part')
    .returns({
         static : 'static'
    });
```

###Module
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
####Dependency Injection
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
    .dependencies(['event-bus'])
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

###Dynamic DOM mutation support
You are able to add (append) and remove DOM elements containing modules. This function is disabled by default but can easily be configured by the domMutationSupport setting.
```js
mom.initModulePage({
   domMutationSupport: true
});
```
Please note: DOM mutation support isn't enabled until all modules are initialized. You can append/remove your modules to DOM at postConstruct or later.

####Adding DOM element containing a module
By adding a DOM element you have to consider nothing but adding the modules-attribute mom is searching for. Your module will be loaded and its parts will be injected automatically. Even your provided postConstruct-function will be called after loading your modules.

#####Adding DOM elements with your module appended
Here is an example how to add an DOM element containing a single module:
```js
// create your child element
var yourChildElement = document.createElement("div");

// configure your child element to have the proper modules-attribute and your javascript-module-name as value
yourChildElement.setAttribute('modules', 'your-javascript-module-name');

// get any existing element you will append the module element as child of
var yourExistingElement = document.getElementById('your existing element');

// append your element as child to the existing element.
yourExistingElement.appendChild(yourChildElement);
```

#####Adding DOM elements with multiple module appended
You can also add modules with multiply modules appended by its names. Here is your example:
```js
// create your child element
var yourChildElement = document.createElement("div");

// configure your child element to have the proper modules-attribute and your javascript-module-names (comma-separated) as value.
yourChildElement.setAttribute('modules', 'your-first-javascript-module-name, your-second-javascript-module-name, your-nth-javascript-module-name');

// get any existing element you will append the module element as child of
var yourExistingElement = document.getElementById('your existing element');

// append your element as child to the existing element.
yourExistingElement.appendChild(yourChildElement);
```

#####Adding DOM elements with with nested elements
The module system will also load modules which are nested itself in surrounding elements you add.
```js
// create your child element
var yourChildElement = document.createElement('div');

// configure your child element to have the proper modules-attribute
yourChildElement.setAttribute('modules', 'your-first-javascript-module-name');

var parentElement = document.createElement('div');
parentElement.appendChild(yourChildElement);

// get any existing element you will append the module element as child of
var yourExistingElement = document.getElementById('your existing element');

// append your element as child to the existing element.
yourExistingElement.appendChild(parentElement);
```
The module system will search recursively for nested module elements and load it.

####Removing DOM element containing a module
The module system will recognize and unload modules if you remove them from DOM.
On unloading the module system do:
- call the preDestruct method (if implemented and published by module object)
- unregister the module from event-bus (if your module returns a module object)
- remove internal registration of the module (if your module returns a module object)

#####Write the preDestruct method
If needed you can clean-up or garbage collect your module by implementing the preDestruct method. It will called directly before unregistering the module object from eventbus and module registry.
Please make sure your preDestruct implementation is NOT throwing any errors.

####Browser compatibility
Please consider that for the Internet Explorer 8, 9 and 10 the dom mutation support has an legacy implementation which behavior slightly differs from the behavior of newer browsers:

#####Overview

| Browser           | Version  | Implementation         |
|-------------------|----------|------------------------|
| Internet explorer | 8, 9, 10 | legacy implementation* |
| Internet explorer | 11       | MutationObserver       |
| Safari            | >=6      | MutationObserver       |
| Firefox           | >=14     | MutationObserver       |
| Chrome            | >=18     | MutationObserver       |

*You may load or implement MutationObserver polyfill to unify the implementation for all browsers.

#####Supported dom mutation functions and properties

| Mutation             | MutationObserver | legacy implementation |
|----------------------|------------------|-----------------------|
| Element.appendChild  | Yes              | Yes                   |
| Element.insertBefore | Yes              | Yes                   |
| Element.removeChild  | Yes              | Yes                   |
| Element.replaceChild | Yes              | Yes                   |
| Element.innerHtml    | Yes              | No                    |

###Test
For testing purposes you could get a part descriptor to retrieve its creator.
```js
mom.createPart('test-part')
   .scope(mom.scope.lazySingleton)
   .settings({
       test: 1
   })
   .dependencies(['test-dependency'])
   .creator(function(testDependency) {

   });

   var def = mom.getPartDescriptor('test-part');
   /* {
         name: 'test-part',
         scope: 'lazy-singleton',
         type: 'creator',
         settings: { test: 1 },
         dependencies: ['test-dependency'],
         creator: function() {
       }
   }
   **/

   var partInstanceToTest = mom.getPartDescriptor('test-part').creator(someMockedDependency)
```

For testing purposes you could get a module descriptor to retrieve its creator.
```js
mom.createModule('test-module')
   .settings({
       test: 1
   })
   .dependencies(['test-dependency'])
   .creator(function(testDependency) {

   });

   var def = mom.getModuleDescriptor('test-module');
   /* {
         name: 'test-module',
         type: 'creator',
         settings: { test: 1 },
         dependencies: ['test-dependency'],
         creator: function() {
       }
   }
   **/

   var moduleInstanceToTest = mom.getModuleDescriptor('test-module').creator(someMockedDependency)
```

To do future releases
-------------
- [ ] add plugin concept for spezialized modules and parts
- [ ] configurable async loading of modules and part
- [ ] debug module access with console
