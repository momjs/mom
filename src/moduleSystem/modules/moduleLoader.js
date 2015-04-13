/*exported moduleLoader */
function moduleLoader(moduleAccess, partAccess, settings) {
   'use strict';

   function initModules() {
      var actualSettings = settings.get(),
         selector = settings.getSelector(),
         modulesOnPage = actualSettings.rootNode.querySelectorAll(selector);

      partAccess.initEagerSingletons();

      each(modulesOnPage, function (element) {
         initModule(element);
      });
      
      partAccess.provisionFinished();
      moduleAccess.provisionFinished();
   }

   function initModule(element) {
      moduleAccess.provisionModule(element);
   }

   return {
      initModulePage: initModules,
      initModule : initModule
   };
}
