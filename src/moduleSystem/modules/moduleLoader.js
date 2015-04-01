/*exported moduleLoader */
function moduleLoader(moduleAccess, partAccess, settings) {
   'use strict';

   function initModules() {
      var selector = settings.selector.replace(/%attribute%/g, settings.attribute),
         modulesOnPage = settings.rootNode.querySelectorAll(selector);

      partAccess.initEagerSingletons();

      each(modulesOnPage, function (index, element) {
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
