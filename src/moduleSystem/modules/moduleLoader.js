/*exported moduleLoader */
function moduleLoader(moduleAccess, partAccess, settings) {
   'use strict';

   function initModulePage() {

      initModules();

      function initModules() {
         var selector = settings.selector.replace(/%attribute%/g, settings.attribute),
            modulesOnPage = document.querySelectorAll(selector);

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
   }

   return {
      initModulePage: initModulePage
   };
}