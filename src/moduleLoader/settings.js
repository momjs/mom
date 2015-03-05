/* jshint unused:false */
function settings() {
   'use strict';

   var defaults = {
         defaultScope: constants.scope.multiInstance,
         settingsSelector: 'script[type="%moduleName%/settings"]',
         attribute: 'modules',
         selector: '[%attribute%]'
      },
      actualSettings = defaults;

   function mergeWith(newSettings) {
      merge(actualSettings, newSettings);
   }


   function get() {
      return actualSettings;
   }

   return {
      get: get,
      mergeWith: mergeWith
   };
}