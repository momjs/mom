/*exported settings */
function settings() {
   'use strict';

   var defaults = {
         rootNode: document,
         defaultScope: constants.scope.multiInstance,
         moduleSettingsSelector: 'script[type="%name%/settings"],script[type="true/%name%/settings"]',
         partSettingsSelector: 'head script[type="%name%/settings"]',
         attribute: 'modules',
         selector: '[%attribute%]',
         domMutationSupport: false,
         customIdAttribute: 'mom-id'
      },
      actualSettings = defaults,
      actualSelector;

   function mergeWith(newSettings) {
      merge(actualSettings, newSettings);
   }

   function get() {
      return actualSettings;
   }

   function getActualSelector() {
      if(actualSelector === undefined) {
         actualSelector = actualSettings.selector.replace(/%attribute%/g, actualSettings.attribute);
      }

      return actualSelector;
   }

   return {
      get: get,
      mergeWith: mergeWith,
      getSelector : getActualSelector
   };
}