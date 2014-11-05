/* global moduleLoader:true */
/* jshint unused:false */
var moduleLoader = function (moduleAccess, partAccess) {
   'use strict';


   function initModulePage() {

      initModules();


      function initModules() {
         var modulesOnPage = document.querySelectorAll('[data-module]'),
             i,
             element;

         for(i = 0; i < modulesOnPage.length; i++) {
            element = modulesOnPage[i];
            initModule(element);
         }

         partAccess.provisionFinished();
         moduleAccess.provisionFinished();

      }
      
      function initModule(element) {
            var $element = $(element);

            moduleAccess.provisionModule($(element));
      }

   }



   return {
      initModulePage: initModulePage
   };
};