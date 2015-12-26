---
layout: default
---
#EventBus

##Sending events
to send a event:

   - a dependency on the eventBus has to be declared
   - after that a module, part can send events and named events

To ensure every listener is initialized a module, part should not send events before the [postConstruct]({{ "/documentations/modules.html#postconstruct-hook"  | prepend: site.baseurl }}) function was called.

{% highlight js %}
mom.createModule('event-sender')
    .dependencie(['event-bus'])
    .creator(function(moduleObj, eventBus) {
        function postConstruct() {
        
            var namedEvent = {
                name : 'NamedEvent',
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
{% endhighlight %}


##Listening to events
listening to events is done via naming conventions of functions. The convention is allways `on + 'EventName'`. To listen to every event the function has to be named `onEvent`.

###Modules
every loaded module is automaticaly registered to the eventBus and can listen to events by returning listener functions to mom.

{% highlight js %}
mom.createModule('hello-world-listener')
    .creator(function(moduleObj) {
        var listener = {
           onEvent: onEvent,
           onNamedEvent: onNamedEvent
        }
        
        eventBus.add(listener);
        
        /////////////////////////////
        
        function onEvent(event) {
           moduleObj.innerHtml = event.data;
        }
        
        function onNamedEvent(event) {
            moduleObj.innerHtml = event.text;
        }
    });
{% endhighlight %}


###Parts
to listent to events with a part it has to be programmatically registered to the eventBus.
{% highlight js %}
mom.createPart('test-part')
    .dependencies(['event-bus'])
    .creator(function(eventBus) {
        var listener = {
           onEvent: onEvent,
           onNamedEvent: onNamedEvent
        }
        
        eventBus.add(listener);
        
        /////////////////////////////
        
        function onEvent(event) {
           console.log(event);
        }
        
        function onNamedEvent(event) {
           console.log(event);
        }
    });
{% endhighlight %}