/**
 * Iterates the array and callback function for each element.
 *
 * @param {Array} array the array to iterate
 * @param {function} callback the callback function:
 *      - first parameter delivers the current index, second the current element
 *      - if the callback function returns true the iteration breaks up immediately
 */
/*exported each */
var each = (function () {
   'use strict';

   function native(array, callback) {
      Array.prototype.forEach.call(array, callback);
   }

   function polyfill(array, callback) {
      var index,
         length = array.length,
         element,
         breakLoop;

      for (index = 0; index < length; index++) {
         element = array[index];

         breakLoop = callback(element, index);

         if (breakLoop) {
            break;
         }
      }
   }

   return (Array.prototype.forEach) ? native : polyfill;
})();
/**
 * Indicates if the specified element looking for is containing in the specified array.
 * @param array the array to lookup
 * @param elementToSearch the element to lookup
 * @returns {boolean} true if the array contains the element, false if not
 */
/*exported contains */
function contains(array, elementToSearch) {
   'use strict';

   var isContaining = false;

   each(array, function (element) {
      if (element === elementToSearch) {
         isContaining = true;
         return true;
      }
   });

   return isContaining;
}

/**
 * Indicates if the passed object is an Array.
 *
 * @param object the object which will be checked to be an Array
 * @returns {boolean} true if the passed object is an Array, false if not
 */
/*exported isArray */
function isArray(object) {
   'use strict';

   return Object.prototype.toString.call(object) === '[object Array]';
}