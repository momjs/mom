/**
 * Created by iso.amon on 05.05.2014.
 */

var engisEventBus = new function() {

    var components = {};

    var self = this;

    var eventPrototype;

    var Events = {
        register : function (event, name) {
            if (typeof event !== 'function') {
                throw new Error("No Event provided");
            }

            if (name in Events) {
                throw new Error("Error registering event, duplicate Event with name [" + event.name + "]");
            }

            if(!eventPrototype) {
                eventPrototype = new self.Event();
            }

            event.prototype = eventPrototype;

            Events[name] = event;

            return event;
        }
    };

    function publishEvent(event, source) {

        // if no event is provided, or event has no name, do not publish an event
        if (typeof event === 'undefined' || typeof event.name === 'undefined') {
            return;
        }

        var callbackFunctionName = "on" + event.name,
            componentName,
            component,
            callback;

        //call components
        for (componentName in components) {
            component = components[componentName];
            callback = component[callbackFunctionName];

            if (typeof callback === "function") {
                source = source || component;
                callback.call(source, event.getData());
            }
        }
    }

    function addComponent(component, replaceDuplicates) {
        if (typeof component === 'undefined') {
            throw new Error("Component to be registered is undefined");
        }
        if (typeof component.name === 'undefined') {
            throw new Error("Component name to be registered is undefined");
        }

        if (component.name in components) {
            if (replaceDuplicates) {
                removeComponent(component.name);
            } else {
                throw new Error("Component with name [" + component.name + "] already registered")
            }
        }

        components[component.name] = component;
    }

    function removeComponent(name) {
        if (name in components) {
            delete components[name];
        }
    }

    self.publish = publishEvent;
    self.add = addComponent;
    self.remove = removeComponent;
    self.Events = Events;

}();

engisModuleSystem.createPart("eventBus").creator(function() {
    return engisEventBus;
});
