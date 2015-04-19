/* exported domEventListener */
function domEventListener(settings, modules, parts) {
   'use strict';

   var actualSettings = settings.get(),
      rootNode = actualSettings.rootNode,
      modulesAttributeSelector = settings.getSelector(),
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

      if(containsNode(rootNode, addedNode)) {
         var addedModules = querySelectorAll(addedNode, modulesAttributeSelector);

         if(matchesSelector(addedNode, modulesAttributeSelector)) {
            loadModule(addedNode);
         }

         each(addedModules, function(addedModule) {
            loadModule(addedModule);
         });

         modules.provisionFinished();
         parts.provisionFinished();
      }
   }

   function containsNode(parentNode, node) {

      if(parentNode === document) {
         return document.body.contains(node);
      }
      else {
         return parentNode.contains(node);
      }
   }

   function onElementRemoved(removedElement) {
      var addedModuleElements = querySelectorAll(removedElement, modulesAttributeSelector);

      each(addedModuleElements, function(moduleElement) {
         unloadModules(moduleElement);
      });

      if (matchesSelector(removedElement, modulesAttributeSelector)) {
         unloadModules(removedElement);
      }
   }

   function querySelectorAll(element, selector) {

      if(element.querySelectorAll) {
         return element.querySelectorAll(selector);
      }

      return [];
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

         (function(appendChild) {
            Element.prototype.appendChild = function(newElement, element) {
               var result = appendChild.apply(this, [newElement, element]);

               onElementAdded(newElement);

               return result;
            };
         })(Element.prototype.appendChild);

         (function(insertBefore) {
            Element.prototype.insertBefore = function(newElement, element) {
               var result = insertBefore.apply(this, [newElement, element]);

               onElementAdded(newElement);

               return result;
            };
         })(Element.prototype.insertBefore);

         (function(removeChild) {
            Element.prototype.removeChild = function(newElement, element) {
               var result = removeChild.apply(this, [newElement, element]);

               onElementRemoved(newElement);

               return result;
            };
         })(Element.prototype.removeChild);
      }

      function unregisterToEvents() {

         (function(appendChild) {
            Element.prototype.appendChild = function(newElement, element) {
               return appendChild.apply(this, [newElement, element]);
            };
         })(appendChild);

         (function(insertBefore) {
            Element.prototype.insertBefore = function(newElement, element) {
               return insertBefore.apply(this, [newElement, element]);
            };
         })(insertBefore);

         (function(removeChild) {
            Element.prototype.removeChild = function(newElement, element) {
               return removeChild.apply(this, [newElement, element]);
            };
         })(removeChild);
      }

      return {
         register : registerToEvents,
         unregister : unregisterToEvents
      };
   }
}
