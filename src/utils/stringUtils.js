/* exported trim */
var trim = (function () {
   'use strict';

   function polyfill(string) {
      return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
   }

   function native(string) {
      return String.prototype.trim.call(string);
   }

   return (String.prototype.trim) ? native : polyfill;
})();