/* exported callAsync */

function callAsync(functionPointer, timeout) {
   'use strict';
   
   var actualTimeout = timeout || 0;

   if(window && window.setTimeout) {
      window.setTimeout(functionPointer, actualTimeout);
   }
}
