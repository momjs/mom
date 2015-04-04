/* exported getDOMSettings */
function SettingsParseException(message) {
   'use strict';
   if (Error.captureStackTrace) {
      Error.captureStackTrace(this);
   }
   this.name = 'SettingsParseException';
   this.message = message;

}
SettingsParseException.prototype = Error.prototype;

/**
 * Searches in the given element for the given selector and parses it's content as JSON
 * 
 * @param   {element} element  the element to search in
 * @param   {string} selector the selector to search for
 * @returns {object} JSON paresed content of element
 * @throws {SettingsParseException} if the content of the element is not valid json
 */
function getDOMSettings(element, selector) {
   'use strict';

   var settingsScript = element.querySelector(selector),
      settingsAsHtml,
      domSettings;

   if (settingsScript !== null) {
      settingsAsHtml = settingsScript.innerHTML;
      try {
         domSettings = JSON.parse(settingsAsHtml);
      } catch (e) {
         throw new SettingsParseException(e.message);
      }
   }

   return domSettings;
}