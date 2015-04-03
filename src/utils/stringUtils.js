/* exported trim */
function trim(string) {
   'use strict';
   return string.replace(/^\s+|\s+$/g, '');
}