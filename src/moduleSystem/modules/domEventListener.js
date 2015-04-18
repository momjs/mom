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
         strategy = createMutationObserverStrategy(WebKitMutationObserver);
      }
      else if(MutationObserver) {
         strategy = createMutationObserverStrategy(MutationObserver);
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

   function createMutationObserverStrategy(ObserverCreator) {

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

      var appendChild = Element.prototype.appendChild,
         insertBefore = Element.prototype.insertBefore,
         removeChild = Element.prototype.removeChild;

      function registerToEvents() {

         Element.prototype.appendChild = function(newElement, element) {
            onElementAdded(newElement);
            return appendChild.apply(this, [newElement, element]);
         };

         Element.prototype.insertBefore = function(newElement, element) {
            onElementAdded(newElement);
            return insertBefore.apply(this, [newElement, element]);
         };

         Element.prototype.removeChild = function(newElement, element) {
            onElementRemoved(newElement);
            return removeChild.apply(this, [newElement, element]);
         };
      }

      function unregisterToEvents() {

         Element.prototype.appendChild = appendChild;
         Element.prototype.insertBefore = insertBefore;
         Element.prototype.removeChild = removeChild;
      }

      return {
         register : registerToEvents,
         unregister : unregisterToEvents
      };
   }
}
