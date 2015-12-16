---
layout: default
---
#Getting started

- Create a module by adding the modules attribute to a dom node.
{% highlight html %}
<div modules="hello-world"></div>
{% endhighlight %}

- register the module in javascript
{% highlight js %}
mom.createModule('hello-world')
    .creator(function(domElement) {
        domElement.innerHTML = 'Hello World';
    });
{% endhighlight %}

- initialize module loading
{% highlight js %}
$(function() {
    mom.initModulePage();
});
{% endhighlight %}

- declare a part dependency inside your module definition
{% highlight js %}
mom.createModule('hello-world')
    .dependencies(['hello-world-part'])
    .creator(function(domElement, helloWorldPart) {
        domElement.innerHTML = helloWorldPart.sayHello();
    });
{% endhighlight %}

- register the part in javascript
{% highlight js %}
mom.createPart('hello-world-part')
    .creator(function() {
        return {
          sayHello: sayHello
        };
        
        ///////////////////////
        
        function sayHello() {
          return 'Hello World';
        }
    });
{% endhighlight %}

- checkout additional documentation on parts and modules