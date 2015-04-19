/* exported getDOMSettings */

/**
 * Searches in the given element for the selector and parses it's content as JSON
 *
 * @param   {element} element  the element to search in
 * @param   {string} selector the selector to search for
 * @param   {string} name of the element to parse
 * @returns {object} JSON paresed content of element
 * @throws {Error} if the content of the element is not valid json
 */
function getDOMSettings(element, selector, name) {
   'use strict';

   var settingsScript = element.querySelector(selector),
      settingsAsHtml,
      domSettings;

   if (settingsScript !== null) {
      settingsAsHtml = settingsScript.innerHTML;
      try {
         domSettings = JSON.parse(settingsAsHtml);
      } catch (e) {
         throw new Error('Module [' + name + '] has invalid json in dom. Message: ' + e.message);
      }
   }

   return domSettings;
}