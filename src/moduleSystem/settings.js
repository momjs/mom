/*exported settingsCreator */
function settingsCreator() {
  'use strict';

  var settings = {
    rootNode: document,
    defaultScope: constants.scope.multiInstance,
    moduleSettingsSelector: 'script[type="%name%/settings"],script[type="true/%name%/settings"]',
    partSettingsSelector: 'head script[type="%name%/settings"]',
    attribute: 'modules',
    selector: '[%attribute%]',
    domMutationSupport: false,
    customIdAttribute: 'mom-id'
  };

  init();

  return settings;

  //////////////////////////////////////////////////////////

  function init() {
    settings.actualSelector = replacePlaceholder(settings.selector, 'attribute', settings.attribute);
    settings.mergeWith = mergeWith;
    settings.getModuleSettingsSelector = getModuleSettingsSelelector;
    settings.getPartSettingsSelector = getPartSettingsSelector;
  }


  function getModuleSettingsSelelector(moduleName) {
    return replacePlaceholder(settings.moduleSettingsSelector, 'name', moduleName);
  }

  function getPartSettingsSelector(partName) {
    return replacePlaceholder(settings.partSettingsSelector, 'name', partName);
  }

  function replacePlaceholder(text, placeholder, value) {
    var actualPlaceholder = '%' + placeholder + '%';
    var regEx;
    var result = text;

    if (stringContains(text, actualPlaceholder)) {
      regEx = new RegExp(actualPlaceholder, 'g');

      result = text.replace(regEx, value);
    }

      return result;
   }

  function mergeWith(newSettings) {
    merge(settings, newSettings);
    init();
  }
}
