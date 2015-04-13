/* exported domEventListener */
function domEventListener(settings, modules, parts) {
   'use strict';

   var actualSettings = settings.get(),
      rootNode = actualSettings.rootNode,
      attributeName = actualSettings.attribute,
      actualSelector = settings.getSelector();

   function registerToEvents() {
      if(actualSettings.domMutationSupport === true) {

         rootNode.addEventListener('DOMNodeInserted', onElementAdded, false);
         rootNode.addEventListener('DOMNodeRemoved', onElementRemoved, false);
      }
   }

   function unregisterToEvents() {
      rootNode.removeEventListener('DOMNodeInserted', onElementAdded);
      rootNode.removeEventListener('DOMNodeRemoved', onElementRemoved, false);
   }

   function onElementAdded(event) {
      var target = event.target,
         addedModules = target.querySelectorAll(actualSelector);

      if(target.hasAttribute(attributeName)) {
         initModule(target);
      }

      each(addedModules, function(addedModule) {
         initModule(addedModule);
      });

      modules.provisionFinished();
      parts.provisionFinished();
   }

   function onElementRemoved(event) {
      var target = event.target,
         addedModuleElements = target.querySelectorAll(actualSelector);

      each(addedModuleElements, function(moduleElement) {
         modules.unloadModules(moduleElement);
      });

      if(target.hasAttribute(attributeName)) {
         modules.unloadModules(target);
      }
   }

   function initModule(moduleElement) {
      return modules.provisionModule(moduleElement);
   }

   return {
      registerToEvents : registerToEvents,
      unregisterToEvents : unregisterToEvents
   };
}