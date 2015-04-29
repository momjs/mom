/* exported callAsync */

function callAsync(functionPointer, timeout) {
   'use strict';
   
   var actualTimeout = timeout || 0;

   setTimeout(functionPointer, actualTimeout);
}
