/* exported callAsync */

/**
 * Calls the given function asynchronously
 *
 * @param {function} function - to execute async
 * @param {number} delay - optional execution deleay
 */
function callAsync(functionPointer, delay) {
   'use strict';

   var actualTimeout = delay || 0;

   setTimeout(functionPointer, actualTimeout);
}
