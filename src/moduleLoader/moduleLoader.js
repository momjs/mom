/* global moduleLoader:true */
/* jshint unused:false */
var moduleLoader = function (moduleAccess, partAccess, settings) {
   'use strict'

   function initModulePage() {

      initModules();

      function initModules() {
         var modulesOnPage = document.querySelectorAll(settings.selector);

         each(modulesOnPage, function(index, element) {
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
};
