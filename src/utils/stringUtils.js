/* exported trim */
function trim(string) {
   'use strict';
   return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}