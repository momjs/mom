/*exported moduleLoaderCreator */
function moduleLoaderCreator(moduleAccess, partAccess, domEventListener, settings) {
   'use strict';

   function initModulePage() {
      var selector = settings.actualSelector,
         modulesOnPage = settings.rootNode.querySelectorAll(selector);

      partAccess.initEagerSingletons();

      each(modulesOnPage, function (element) {
         initModule(element);
      });
     
      if (settings.domMutationSupport === true) {
          domEventListener.registerToEvents();
      }

      partAccess.provisionFinished();
      moduleAccess.provisionFinished();
   }

   function initModule(element) {
      moduleAccess.provisionModule(element);
   }

   return {
      initModulePage: initModulePage,
      initModule: initModule
   };
}