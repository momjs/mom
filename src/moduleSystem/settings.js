/*exported settings */
function settings() {
   'use strict';

   var defaults = {
         rootNode: document,
         defaultScope: constants.scope.multiInstance,
         moduleSettingsSelector: 'script[type="%moduleName%/settings"]',
         partSettingsSelector: 'head script[type="%partName%/settings"]',
         attribute: 'modules',
         selector: '[%attribute%]',
         logger: function () {
            if (console.error.apply) {
               console.error.apply(console, arguments);
            }
         }
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