---
layout: default
---
#Dynamic DOM mutation support

You are able to add (append) and remove DOM elements containing modules. This function is disabled by default but can easily be configured by the domMutationSupport setting.
{% highlight js %}
mom.initModulePage({
   domMutationSupport: true
});
{% endhighlight %}

##Adding DOM element containing a module

By adding a DOM element you have to consider nothing but adding the modules-attribute mom is searching for. Your module will be loaded and its parts will be injected automatically. Even your provided postConstruct-function will be called after loading your modules.

###Adding DOM elements with your module appended

Here is an example how to add an DOM element containing a single module:
{% highlight js %}
// create your child element
var yourChildElement = document.createElement("div");

// configure your child element to have the proper modules-attribute and your javascript-module-name as value
yourChildElement.setAttribute('modules', 'your-javascript-module-name');

// get any existing element you will append the module element as child of
var yourExistingElement = document.getElementById('your existing element');

// append your element as child to the existing element.
yourExistingElement.appendChild(yourChildElement);
{% endhighlight %}

###Adding DOM elements with multiple module appended

You can also add modules with multiply modules appended by its names. Here is your example:
{% highlight js %}
// create your child element
var yourChildElement = document.createElement("div");

// configure your child element to have the proper modules-attribute and your javascript-module-names (comma-separated) as value.
yourChildElement.setAttribute('modules', 'your-first-javascript-module-name, your-second-javascript-module-name, your-nth-javascript-module-name');

// get any existing element you will append the module element as child of
var yourExistingElement = document.getElementById('your existing element');

// append your element as child to the existing element.
yourExistingElement.appendChild(yourChildElement);
{% endhighlight %}

###Adding DOM elements with with nested elements

The module system will also load modules which are nested itself in surrounding elements you add.
{% highlight js %}
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
{% endhighlight %}
The module system will search recursively for nested module elements and load it.

##Removing DOM element containing a module

The module system will recognize and unload modules if you remove them from DOM.
On unloading the module system do:
- call the preDestruct method (if implemented and published by module object)
- unregister the module from event-bus (if your module returns a module object)
- remove internal registration of the module (if your module returns a module object)

###Write the preDestruct method

If needed you can clean-up or garbage collect your module by implementing the preDestruct method. It will called directly before unregistering the module object from eventbus and module registry.
Please make sure your preDestruct implementation is NOT throwing any errors.

##Browser compatibility

Please consider that for the Internet Explorer 8, 9 and 10 the dom mutation support has an legacy implementation which behavior slightly differs from the behavior of newer browsers:

###Overview

| Browser           | Version  | Implementation         |
|-------------------|----------|------------------------|
| Internet explorer | 8, 9, 10 | legacy implementation* |
| Internet explorer | 11       | MutationObserver       |
| Safari            | >=6      | MutationObserver       |
| Firefox           | >=14     | MutationObserver       |
| Chrome            | >=18     | MutationObserver       |

*You may load or implement MutationObserver polyfill to unify the implementation for all browsers.

###Supported dom mutation functions and properties

| Mutation             | MutationObserver | legacy implementation |
|----------------------|------------------|-----------------------|
| Element.appendChild  | Yes              | Yes                   |
| Element.insertBefore | Yes              | Yes                   |
| Element.removeChild  | Yes              | Yes                   |
| Element.replaceChild | Yes              | Yes                   |
| Element.innerHtml    | Yes              | No                    |

