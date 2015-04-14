/*exported settings */
function settings() {
   'use strict';

   var _settings = {
         rootNode: document,
         defaultScope: constants.scope.multiInstance,
         moduleSettingsSelector: 'script[type="%name%/settings"]',
         partSettingsSelector: 'head script[type="%name%/settings"]',
         attribute: 'modules',
         selector: '[%attribute%]',
         mergeWith: mergeWith
      };

   function mergeWith(newSettings) {
      merge(_settings, newSettings);
   }


   return _settings;
}