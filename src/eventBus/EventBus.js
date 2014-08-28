/* global eventBus:true */
/* jshint unused:false */
var eventBus = (function() {
    'use strict';

    function Event(name) {
        this.name = name;
        this.getData = function() {
            var result = {};

            for (var property in this) {
                if (this.hasOwnProperty(property) && property !== 'name' && property !== 'getData') {
                    result[property] = this[property];
                }
            }

            return result;
        };
    }

    var components = {},
        eventPrototype = new Event(),
        Events = {

            register: function(Event, name) {
                if (typeof Event !== 'function') {
                    throw new Error('No Event provided');
                }

                if (name in Events) {
                    throw new Error('Error registering event, duplicate Event with name [' + name + ']');
                }

                Event.prototype = eventPrototype;

                Events[name] = Event;

                return Event;
            }
        };

    function publishEvent(event, source) {

        // if no event is provided, or event has no name, do not publish an event
        if (typeof event === 'undefined' || typeof event.name === 'undefined') {
            return;
        }

        var callbackFunctionName = 'on' + event.name,
            componentName,
            component,
            callback;

        //call components
        for (componentName in components) {
            if(components.hasOwnProperty(componentName)) {
                component = components[componentName];
                callback = component[callbackFunctionName];

                if (typeof callback === 'function') {
                    source = source || component;
                    callback.call(source, event.getData());
                }
            }
        }
    }

    function addComponent(component, replaceDuplicates) {
        if (typeof component === 'undefined') {
            throw new Error('Component to be registered is undefined');
        }
        if (typeof component.name === 'undefined') {
            throw new Error('Component name to be registered is undefined');
        }

        if (component.name in components) {
            if (replaceDuplicates) {
                removeComponent(component.name);
            } else {
                throw new Error('Component with name [' + component.name + '] already registered');
            }
        }

        components[component.name] = component;
    }

    function removeComponent(name) {
        if (name in components) {
            delete components[name];
        }
    }

    function reset() {
        components = {};
    }


    return {
        publish: publishEvent,
        add: addComponent,
        remove: removeComponent,
        reset: reset,
        Events: Events
    };

})();

moduleSystem.createPart('eventBus').creator(function() {
    'use strict';
    return eventBus;
});