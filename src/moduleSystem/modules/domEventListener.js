/* exported domEventListener */
function domEventListener(settings, modules, parts) {
   'use strict';

   var actualSettings = settings.get(),
      rootNode = actualSettings.rootNode,
      attributeName = actualSettings.attribute,
      actualSelector = settings.getSelector(),
      registerStrategy = decideDomMutationStrategy();

   function decideDomMutationStrategy() {
      var strategy = tryToGetMutationObserverStrategy();
      // TODO remove the following line to enable/disable MutationObserver support
      //strategy = null;

      if(strategy === null) {
         return createLegacyDomMutationStrategy();
      }

      return strategy;
   }

   function onElementAdded(addedNode) {
      var addedModules = addedNode.querySelectorAll(actualSelector);

      if(addedNode.hasAttribute(attributeName)) {
         loadModule(addedNode);
      }

      each(addedModules, function(addedModule) {
         loadModule(addedModule);
      });

      modules.provisionFinished();
      parts.provisionFinished();
   }

   function onElementRemoved(removedElement) {
      var addedModuleElements = removedElement.querySelectorAll(actualSelector);

      each(addedModuleElements, function(moduleElement) {
         unloadModules(moduleElement);
      });

      if(removedElement.hasAttribute(attributeName)) {
         unloadModules(removedElement);
      }
   }

   function loadModule(moduleElement) {
      return modules.provisionModule(moduleElement);
   }

   function unloadModules(moduleElement) {
      modules.unloadModules(moduleElement);
   }

   return {
      registerToEvents : registerStrategy.register,
      unregisterToEvents : registerStrategy.unregister
   };

   function tryToGetMutationObserverStrategy() {

      var ObserverCreator = window.MutationObserver || window.WebKitMutationObserver || null,
         observerConfig = { attributes: true, childList: true, characterData: true, subtree: true },
         observer;

      if(ObserverCreator !== null) {
         observer = new ObserverCreator(onMutation);

         return {
            register : registerToEvents,
            unregister : unregisterToEvents
         };
      }
      else {
         return null;
      }

      function registerToEvents() {
         observer.observe(rootNode, observerConfig);
      }

      function unregisterToEvents() {
         //observer.disconnect();
      }

      function onMutation(mutations, observer) {

         each(mutations, function(mutationRecord) {

            each(mutationRecord.addedNodes, function(addedNode) {
               onElementAdded(addedNode);
            });

            each(mutationRecord.removedNodes, function(removedNode) {
               onElementRemoved(removedNode);
            });
         });

         observer.takeRecords();
      }
   }

   function createLegacyDomMutationStrategy() {

      var DOM_NODE_INSERTED_EVENT_NAME = 'DOMNodeInserted',
         DOM_NODE_REMOVED_EVENT_NAME = 'DOMNodeRemoved';

      function registerToEvents() {
         rootNode.addEventListener(DOM_NODE_INSERTED_EVENT_NAME, onDomNodeInserted, false);
         rootNode.addEventListener(DOM_NODE_REMOVED_EVENT_NAME, onDomNodeRemoved, false);
      }

      function onDomNodeInserted(event) {
         onElementAdded(event.target);
      }

      function unregisterToEvents() {
         rootNode.removeEventListener(DOM_NODE_INSERTED_EVENT_NAME, onDomNodeInserted);
         rootNode.removeEventListener(DOM_NODE_REMOVED_EVENT_NAME, onDomNodeRemoved, false);
      }

      function onDomNodeRemoved(event) {
         onElementRemoved(event.target);
      }

      return {
         register : registerToEvents,
         unregister : unregisterToEvents
      };
   }
}
