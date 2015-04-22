/* exported domEventListenerCreator */
function domEventListenerCreator(settings, modules, parts) {
   'use strict';

   var rootNode = settings.rootNode,
      modulesAttributeSelector = settings.actualSelector,
      registerStrategy = decideDomMutationStrategy();

   function decideDomMutationStrategy() {
      var WebKitMutationObserver = window.WebKitMutationObserver,
         MutationObserver = window.MutationObserver,
         strategy;

      if (WebKitMutationObserver) {
         strategy = createMutationObserverStrategy(WebKitMutationObserver);
      } else if (MutationObserver) {
         strategy = createMutationObserverStrategy(MutationObserver);
      } else {
         strategy = createLegacyDomMutationStrategy();
      }

      return strategy;
   }

   function onElementAdded(addedNode) {

      if (containsNode(rootNode, addedNode)) {
         var addedModules = querySelectorAll(addedNode, modulesAttributeSelector);

         if (matchesSelector(addedNode, modulesAttributeSelector)) {
            loadModule(addedNode);
         }

         each(addedModules, function (addedModule) {
            loadModule(addedModule);
         });

         modules.provisionFinished();
         parts.provisionFinished();
      }
   }

   function containsNode(parentNode, node) {

      if (parentNode === document) {
         return document.body.contains(node);
      } else {
         return parentNode.contains(node);
      }
   }

   function onElementRemoved(removedElement) {
      var addedModuleElements = querySelectorAll(removedElement, modulesAttributeSelector);

      each(addedModuleElements, function (moduleElement) {
         unloadModules(moduleElement);
      });

      if (matchesSelector(removedElement, modulesAttributeSelector)) {
         unloadModules(removedElement);
      }
   }

   function onElementReplaced(newElement, oldElement) {

      onElementAdded(newElement);
      onElementRemoved(oldElement);
   }


   function querySelectorAll(element, selector) {

      if (element.querySelectorAll) {
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
      registerToEvents: registerStrategy.register,
      unregisterToEvents: registerStrategy.unregister
   };

   function createMutationObserverStrategy(ObserverCreator) {

      var observerConfig = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
         },
         observer = new ObserverCreator(onMutation);

      function registerToEvents() {
         observer.observe(rootNode, observerConfig);
      }

      function unregisterToEvents() {
         observer.takeRecords();
         observer.disconnect();
      }

      function onMutation(mutations, observer) {

         each(mutations, function (mutationRecord) {

            each(mutationRecord.addedNodes, function (addedNode) {
               onElementAdded(addedNode);
            });

            each(mutationRecord.removedNodes, function (removedNode) {
               onElementRemoved(removedNode);
            });
         });

         observer.takeRecords();
      }

      return {
         register: registerToEvents,
         unregister: unregisterToEvents
      };
   }

   function createLegacyDomMutationStrategy() {

      var appendChild = Element.prototype.appendChild,
         insertBefore = Element.prototype.insertBefore,
         removeChild = Element.prototype.removeChild,
         replaceChild = Element.prototype.replaceChild;

      function registerToEvents() {

         (function (appendChild) {
            Element.prototype.appendChild = function (newElement, element) {
               var result = appendChild.call(this, newElement, element);

               onElementAdded(newElement);

               return result;
            };
         })(Element.prototype.appendChild);

         (function (insertBefore) {
            Element.prototype.insertBefore = function (newElement, element) {
               var result = insertBefore.call(this, newElement, element);

               onElementAdded(newElement);

               return result;
            };
         })(Element.prototype.insertBefore);

         (function (removeChild) {
            Element.prototype.removeChild = function (newElement, element) {
               var result = removeChild.call(this, newElement, element);

               onElementRemoved(newElement);

               return result;
            };
         })(Element.prototype.removeChild);

         (function (replaceChild) {
            Element.prototype.replaceChild = function (newElement, oldElement) {
               var result = replaceChild.call(this, newElement, oldElement);

               onElementReplaced(newElement, oldElement);

               return result;
            };
         })(Element.prototype.replaceChild);
      }

      function unregisterToEvents() {

         (function (appendChild) {
            Element.prototype.appendChild = appendChild;
         })(appendChild);
         (function (insertBefore) {
            Element.prototype.insertBefore = insertBefore;
         })(insertBefore);

         (function (removeChild) {
            Element.prototype.removeChild = removeChild;
         })(removeChild);

         (function (replaceChild) {
            Element.prototype.replaceChild = replaceChild;
         })(replaceChild);
      }

      return {
         register: registerToEvents,
         unregister: unregisterToEvents
      };
   }
}