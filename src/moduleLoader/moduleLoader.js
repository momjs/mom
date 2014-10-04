/* global moduleLoader:true */
/* jshint unused:false */
var moduleLoader = function (moduleAccess, partAccess) {
   'use strict';


   function initModulePage() {

      initModules();


      function initModules() {
         var $modulesOnPage = $('[data-module]');

         $modulesOnPage.each(function (index, element) {
            var $element = $(element);

            moduleAccess.provisionModule($(element));

         });

         partAccess.provisionFinished();
         moduleAccess.provisionFinished();

      }

   }



   return {
      initModulePage: initModulePage
   };
};