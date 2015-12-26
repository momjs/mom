---
layout: default
---
#Modules

##Creation and registration

{% highlight js %}
mom.createModule('hello-world')
    .creator(function(moduleObj) {
        alert('Hello ' + moduleObj.innerHTML;
    });
{% endhighlight %}

this module gets loaded when a DOM-element with attribute modules="helloWorld" is found. The found DOM-Node is then given to the Module as the first parameter
{% highlight html %}
<div modules="hello-world">World</div> // alerts Hello World
{% endhighlight %}

Incase more than one DOM-Node with the same module is found more than one module-object are initialized
{% highlight html %}
<div modules="hello-world">World1</div> //alerts Hello World1
<div modules="hello-world">World2</div> //alerts Hello World2
{% endhighlight %}

##Configure

like parts modules could be provisioned with settings
{% highlight js %}
mom.createModule('static-hello-world')
    .settings({staticText : 'World'})
    .creator(function(moduleObj, settings) {
        alert('Hello ' + settings.staticText;
    });
{% endhighlight %}

{% highlight html %}
<div modules="static-hello-world" /> //alerts Hello World
{% endhighlight %}

###Override from DOM

an additional setting which merges/overrides the default settings object could be provided via DOM
{% highlight html %}
<div modules="static-hello-world"> //alerts Hello Module
  <script type="staticHelloWorld/settings"> 
    {
      "staticText" : "Module"
    }
  </script>
</div>
{% endhighlight %}

##Dependencie Injection

modules could be composed out of parts.
It's a design decision to not allow modules to be injected in other modules. Use the EventBus for communication between modules.
{% highlight js %}
mom.createModule('static-hello-world-with-dependencies')
    .settings({staticText : 'World'})
    .dependencies(['adder'])
    .creator(function(moduleObj, settings, adder) {
        alert('Hello ' + settings.staticText + ' ' + adder.add(1,2);
    });
{% endhighlight %}

{% highlight html %}
<div modules="static-hello-world-with-dependencies" /> //alerts Hello World 3
{% endhighlight %}

####PostConstruct Hook
every module could decide to publish a postConstruct method which gets executed after every module is properly initialized.
This should be used if a event could be resulting from the actions in place. Because if an event is published before all modules are initialized, a listening module could not listening to the EventBus already and miss the event. 
{% highlight js %}
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
{% endhighlight %}

{% highlight html %}
<div modules="hello-world-publisher" /> //publish hello world changed
{% endhighlight %}

##Communication between modules

modules should communicate over the eventBus to prevent tight coupling. 
For this every module is added to the EventBus automatically. For this a public method have to be exposed with a name like: on + EventName (eg. onHelloWorldChanged)

Detailed documentation:
[eventBus]({{ "/documentations/eventBus.html"  | prepend: site.baseurl }})

##More than one Module per DOM-Element

sometimes it is useful to handle a dom element with more than one js-module. For this it is possible to load more than one module with a comma separated list

{% highlight html %}
<div modules="module-to-load1,other-module-to-load" /> // loads two modules with the same moduleObj
{% endhighlight %}

##Start Provisioning

when every module is registered in the module system initModulePage() should be called. This would typically be done on DOM ready

{% highlight js %}
$(function() {
    mom.initModulePage();
});
{% endhighlight %}
