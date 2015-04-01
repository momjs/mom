/* exported domEventListener */
function domEventListener(settings, moduleLoader) {
   'use strict';

   var rootNode = settings.rootNode,
      attributeName = settings.attribute,
      actualSelector;

   function registerToEvents() {
      rootNode.addEventListener('DOMNodeInserted', onElementAdded, false);

      // FIXME this line is copied from moduleLoader
      actualSelector = settings.selector.replace(/%attribute%/g, settings.attribute);
   }

   function onElementAdded(event) {
      var target = event.target,
         addedModules = target.querySelectorAll(actualSelector);

      if(target.hasAttribute(attributeName)) {
         initModule(target);
      }

      each(addedModules, function(index, addedModule) {
         initModule(addedModule);
      });
   }

   function initModule(moduleElement) {
      moduleLoader.initModule(moduleElement);
   }

   return {
      registerToEvents : registerToEvents
   };
}