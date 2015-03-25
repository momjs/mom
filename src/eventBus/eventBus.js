/*exported eventBus */
function eventBus() {
   'use strict';

   var ON_EVENT_FUNCTION_NAME = 'onEvent',
      components = [];

   function publishEvent(event) {

      if (event === undefined) {
         throw new Error('Published event cannot be undefined');
      }

      var callbackFunctionName = 'on' + event.name;

      each(components, function (index, component) {

         if (event.name !== undefined) {
            tryToCallComponent(component, callbackFunctionName, event);
         }

         tryToCallComponent(component, ON_EVENT_FUNCTION_NAME, event);
      });
   }

   function tryToCallComponent(component, functionName, event) {

      var callback = component[functionName];

      if (typeof callback === 'function') {
         callback.call(component, event);
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
