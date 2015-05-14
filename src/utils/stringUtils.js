/* exported trim */
/* exported stringContains */

/**
 * Removes whitespaces from both sides of a string
 * the function does not modify the content of the sting
 * uses nativ trim if present
 * @param {string} text - input string
 * @returns {string} the modified string
 */
var trim = (function () {
   'use strict';

   function polyfill(text) {
      return text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
   }

   function native(text) {
      return String.prototype.trim.call(text);
   }

   return (String.prototype.trim) ? native : polyfill;
})();

/**
 * Searches in text for value returns true if value is found.
 * false if not
 * @param {string} text - input string
 * @param {string} value - the value to search
 * @returns {boolean} conatins
 */
function stringContains(text, value) {
   'use strict';

   return text.indexOf(value) > -1;
}
