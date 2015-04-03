/*exported eventBus */
function eventBus() {
   'use strict';

   var ON_EVENT_FUNCTION_NAME = 'onEvent',
      listeners = [];

   function publishEvent(event) {

      if (event === undefined) {
         throw new Error('Published event cannot be undefined');
      }

      var callbackFunctionName = 'on' + event.name;

      each(listeners, function (index, listener) {

         if (event.name !== undefined) {
            tryToCallListener(listener, callbackFunctionName, event);
         }

         tryToCallListener(listener, ON_EVENT_FUNCTION_NAME, event);
      });
   }

   function tryToCallListener(listener, functionName, event) {

      var callback = listener[functionName];

      if (typeof callback === 'function') {
         callback.call(listener, event);
      }
   }

   function addListener(listener) {
      if (listener === undefined) {
         throw new Error('Listener to be registered is undefined');
      }

      if (contains(listeners, listener)) {
         throw new Error('Listener is already registered');
      }

      listeners.push(listener);
   }

   function removeListener(listener) {
      if(listener === undefined) {
         throw new Error('Listener to be removed is undefined');
      }

      var hasBeenRemoved = remove(listeners, listener);

      if(!hasBeenRemoved) {
         throw new Error('Listener to be removed is not registered');
      }
   }

   function reset() {
      listeners = [];
   }

   return {
      publish: publishEvent,
      add: addListener,
      remove: removeListener,
      reset: reset
   };
}
