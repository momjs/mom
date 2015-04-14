/*exported settingsCreator */
function settingsCreator() {
   'use strict';

   var settings = {
      rootNode: document,
      defaultScope: constants.scope.multiInstance,
      moduleSettingsSelector: 'script[type="%name%/settings"]',
      partSettingsSelector: 'head script[type="%name%/settings"]',
      attribute: 'modules',
      selector: '[%attribute%]',
      mergeWith: mergeWith
   };

   function mergeWith(newSettings) {
      merge(settings, newSettings);
   }

   return settings;
}