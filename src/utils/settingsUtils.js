function SettingsParseException(message) {
   'use strict';
   if (Error.captureStackTrace) {
      Error.captureStackTrace(this);
   }
   this.name = 'SettingsParseException';
   this.message = message;

}
SettingsParseException.prototype = Error.prototype;

/*exported getDOMSettings */
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