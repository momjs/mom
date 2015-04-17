/* exported domEventListener */
function domEventListener(settings, modules, parts) {
   'use strict';

   var actualSettings = settings.get(),
      rootNode = actualSettings.rootNode,
      attributeName = actualSettings.attribute,
      actualSelector = settings.getSelector(),
      registerStrategy = decideDomMutationStrategy();

   function decideDomMutationStrategy() {
      var WebKitMutationObserver = window.WebKitMutationObserver,
         MutationObserver = window.MutationObserver,
         strategy;

      if(WebKitMutationObserver) {
         strategy = tryToGetMutationObserverStrategy(WebKitMutationObserver);
      }
      else if(MutationObserver) {
         strategy = tryToGetMutationObserverStrategy(MutationObserver);
      }
      else {
         strategy = createLegacyDomMutationStrategy();
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

   function tryToGetMutationObserverStrategy(ObserverCreator) {

      var observerConfig = { attributes: true, childList: true, characterData: true, subtree: true },
         observer = new ObserverCreator(onMutation);

      function registerToEvents() {
         observer.observe(rootNode, observerConfig);
      }

      function unregisterToEvents() {
         observer.takeRecords();
         observer.disconnect();
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

      return {
         register : registerToEvents,
         unregister : unregisterToEvents
      };
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
