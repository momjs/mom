/*exported each */
/*exported contains */
/*exported isArray */
/* exported remove */

/**
 * Iterates the array and callback function for each element.
 * Uses nativ forEach if present
 *
 * @param {Array} array - the array to iterate
 * @param {eachCallback} - callback the callback function:
 */
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

         breakLoop = callback(element, index, array);

         if (breakLoop) {
            break;
         }
      }
   }

   return (Array.prototype.forEach) ? native : polyfill;
})();
/**
 * @callback eachCallback
 * @param element - the current element
 * @param {number} index - the current index
 * @param {array} array - the current array
 * @returns {undefined | boolean} if returns true the iteration breaks up immediately
 */


/**
 * Indicates if the specified element looking for is containing in the specified array.
 *
 * @param {array} array - the array to lookup
 * @param elementToSearch - the element to lookup
 * @returns {boolean} true if the array contains the element, false if not
 */
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
 * @param object - the object which will be checked to be an Array
 * @returns {boolean} true if the passed object is an Array, false if not
 */
function isArray(object) {
   'use strict';

   return Object.prototype.toString.call(object) === '[object Array]';
}

/**
 * Remove the passed element from the passed array
 * @param array the array to remove the passed element
 * @param element the element which will be removed from the passed array
 * @returns {boolean} returns true if the element has been removed, returns false otherwise
 */
function remove(array, element) {
   'use strict';

   var index = array.indexOf(element);

   if (index > -1) {
      array.splice(index, 1);
      return true;
   }

   return false;
}
