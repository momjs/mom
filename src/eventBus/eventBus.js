/* jshint unused:false */
function eventBus() {
    'use strict';

    var ON_EVENT_FUNCTION_NAME = 'onEvent',
        components = {};

    function publishEvent(event) {

        if (event === undefined) {
            return;
        }

        var callbackFunctionName = 'on' + event.name,
            componentName;

        for (componentName in components) {
            if(components.hasOwnProperty(componentName)) {

                if (event.name !== undefined) {
                    tryToCallComponent(componentName, callbackFunctionName, event);
                }

                tryToCallComponent(componentName, ON_EVENT_FUNCTION_NAME, event);
            }
        }
    }

    function tryToCallComponent(componentName, functionName, event) {

        var component = components[componentName],
            callback = component[functionName];

        if (typeof callback === 'function') {
            callback.call(null, event);
        }
    }

    function addComponent(component) {
        if (component === undefined) {
            throw new Error('Component to be registered is undefined');
        }
        if (component.name === undefined) {
            throw new Error('Component name to be registered is undefined');
        }

        if (component.name in components) {
            throw new Error('Component with name [' + component.name + '] already registered');
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
        reset: reset
    };
}
