/*exported settings */
function settings() {
   'use strict';

   var defaults = {
         rootNode: document,
         defaultScope: constants.scope.multiInstance,
         moduleSettingsSelector: 'script[type="%name%/settings"]',
         partSettingsSelector: 'head script[type="%name%/settings"]',
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