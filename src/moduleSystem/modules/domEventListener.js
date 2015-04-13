/* exported domEventListener */
function domEventListener(settings, modules, parts) {
   'use strict';

   var rootNode = settings.rootNode,
      attributeName = settings.attribute,
      actualSelector;

   function registerToEvents() {
      if(settings.domMutationSupport === true) {

         rootNode.addEventListener('DOMNodeInserted', onElementAdded, false);
         rootNode.addEventListener('DOMNodeRemoved', onElementRemoved, false);

         // FIXME this line is copied from moduleLoader
         actualSelector = settings.selector.replace(/%attribute%/g, settings.attribute);
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