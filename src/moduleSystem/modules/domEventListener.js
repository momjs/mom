/* exported domEventListenerCreator */
function domEventListenerCreator(settings, modules, parts) {
   'use strict';

   var registerStrategy = decideDomMutationStrategy();
   var ELEMENT_NODE = (window.Node) ? Node.ELEMENT_NODE : 1;

   function decideDomMutationStrategy() {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
         strategy;

      if (MutationObserver) {
         strategy = createMutationObserverStrategy(MutationObserver);
      } else {
         strategy = createLegacyDomMutationStrategy();
      }

      return strategy;
   }

   function onElementAdded(addedNode) {
     if(addedNode.nodeType === ELEMENT_NODE) {
       if (containsNode(settings.rootNode, addedNode)) {
         var addedModules = querySelectorAll(addedNode, settings.actualSelector);

         if (matchesSelector(addedNode, settings.actualSelector)) {
            loadModule(addedNode);
         }

         each(addedModules, function (addedModule) {
            loadModule(addedModule);
         });

         modules.provisionFinished();
         parts.provisionFinished();
      }
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
      if(removedElement.nodeType === ELEMENT_NODE) {
        var addedModuleElements = querySelectorAll(removedElement, settings.actualSelector);

        each(addedModuleElements, function (moduleElement) {
           unloadModules(moduleElement);
        });

        if (matchesSelector(removedElement, settings.actualSelector)) {
           unloadModules(removedElement);
        }
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
         observer.observe(settings.rootNode, observerConfig);
      }

      function unregisterToEvents() {
         observer.takeRecords();
         observer.disconnect();
      }

      function onMutation(mutations, observer) {
         var addedNodes, removedNodes;

         each(mutations, function (mutationRecord) {
            addedNodes = mutationRecord.addedNodes;
            removedNodes = mutationRecord.removedNodes;

            /* on Safari 6 the added nodes may be null */
            if(addedNodes !== null) {
               each(addedNodes, function (addedNode) {
                  onElementAdded(addedNode);
               });
            }

            /* on Safari 6 the removed nodes may be null */
            if(removedNodes !== null) {
               each(removedNodes, function (removedNode) {
                  onElementRemoved(removedNode);
               });
            }
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

         Element.prototype.appendChild = function (newElement, element) {
            var result = appendChild.call(this, newElement, element);

            callAsync(function() {
               onElementAdded(newElement);
            });

            return result;
         };

         Element.prototype.insertBefore = function (newElement, element) {
            var result = insertBefore.call(this, newElement, element);

            callAsync(function() {
               onElementAdded(newElement);
            });

            return result;
         };

         Element.prototype.removeChild = function (newElement, element) {
            var result = removeChild.call(this, newElement, element);

            callAsync(function() {
               onElementRemoved(newElement);
            });

            return result;
         };

         Element.prototype.replaceChild = function (newElement, oldElement) {
            var result = replaceChild.call(this, newElement, oldElement);

            callAsync(function() {
               onElementReplaced(newElement, oldElement);
            });

            return result;
         };
      }

      function unregisterToEvents() {

         Element.prototype.appendChild = function (newElement, element) {
            return appendChild.call(this, newElement, element);
         };

         Element.prototype.insertBefore = function (newElement, element) {
            return insertBefore.call(this, newElement, element);
         };


         Element.prototype.removeChild = function (newElement, element) {
            return removeChild.call(this, newElement, element);
         };

         Element.prototype.replaceChild = function (newElement, oldElement) {
            return replaceChild.call(this, newElement, oldElement);
         };
      }

      return {
         register: registerToEvents,
         unregister: unregisterToEvents
      };
   }
}
