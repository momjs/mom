---
layout: default
---
#Parts

Utility functions like e.g. AJAX loader etc.

##Creation and registration

###Creator Parts

{% highlight js %}
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
{% endhighlight %}

####Scopes

By default the module system creates a new instance each time it suplies a part.
To change this behaviour a scope could be specified

#####Lazy Singleton

{% highlight js %}
mom.createPart('singleton-part')
    .scope('lazy-singleton')
    .creator(function() {
        ...
    });
{% endhighlight %}
Or the default behaviour could be changed
{% highlight js %}
mom.initModulePage({
   defaultScope : 'lazy-singleton'
});
{% endhighlight %}
A lazy singleton part gets created on the first request and is reused on following requests.

#####Eager Singleton

{% highlight js %}
mom.createPart('singleton-part')
    .scope('eager-singleton')
    .creator(function() {
        ...
    });
{% endhighlight %}
A eager singleton part gets created every time initModulePage() is called, even when no module/part has it as an depedency.
There is only one intance of this module which gets reused.

####Configure

{% highlight js %}
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
{% endhighlight %}

#####Override from DOM

an additional setting which merges/overrides with the default settings object could be provided via DOM.
The configuration has to be put in the html head
{% highlight html %}
<html>
<head>
   <script type="adder/settings">
   {
      "isDebug": false
   }
   </script>
</head>
</html>
{% endhighlight %}

##Dependency Injection

creator parts could be composed of other parts
{% highlight js %}
mom.createPart('calculator')
    .dependencies(['adder', 'multiplier', 'static-part'])
    .creator(function(adder, multiplier, staticPart) {
        console.log(staticPart.static);
 
        return {
            add : adder.add,
            multiply : multiplier.multiply
        };
    });
{% endhighlight %}

##Returns Parts

If a part don't need a constructor function to be called (e.g. has no dependencies, settings, etc), a returns part could be used
{% highlight js %}
mom.createPart('static-part')
    .returns({
         static : 'static'
    });
{% endhighlight %}