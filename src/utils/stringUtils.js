/* exported trim */
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