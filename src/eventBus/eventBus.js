/* jshint unused:false */
function eventBus() {
    'use strict';

    var ON_EVENT_FUNCTION_NAME = 'onEvent',
        components = [];

    function publishEvent(event) {

        if (event === undefined) {
            return;
        }

        var callbackFunctionName = 'on' + event.name;

        each(components, function(index, component) {

            if (event.name !== undefined) {
                tryToCallComponent(component, callbackFunctionName, event);
            }

            tryToCallComponent(component, ON_EVENT_FUNCTION_NAME, event);
        });
    }

    function each(array, callback) {
        var index,
            length = array.length,
            element,
            breakLoop;

        for(index = 0; index < length; index++) {
            element = array[index];

            breakLoop = callback(index, element);

            if(breakLoop) {
                break;
            }
        }
    }

    function contains(array, elementToSearch) {
        var index,
            length = array.length,
            element,
            contains = false;

        for(index = 0; index < length; index++) {
            element = array[index];

            if(element === elementToSearch) {
                contains = true;
                break;
            }
        }

        return contains;
    }

    function tryToCallComponent(component, functionName, event) {

        var callback = component[functionName];

        if (typeof callback === 'function') {
            callback.call(null, event);
        }
    }

    function addComponent(component) {
        if (component === undefined) {
            throw new Error('Component to be registered is undefined');
        }

        if (contains(components, component)) {
            throw new Error('Component is already registered');
        }

        components.push(component);
    }

    function reset() {
        components = [];
    }

    return {
        publish: publishEvent,
        add: addComponent,
        reset: reset
    };
}
