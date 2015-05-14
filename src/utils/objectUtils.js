/*exported eachProperty*/
/*exported merge */
/**
 * Iterates over all own properties of the specified object.
 *
 * @param {object} object - to iterate over
 * @param {eachPropertyCallback} callback - function which will be called for each property key and value
 */
function eachProperty(object, callback) {
   'use strict';

   var key,
      value,
      breakup;

   for (key in object) {
      if (object.hasOwnProperty(key)) {

         value = object[key];
         breakup = callback(value, key);

         if (breakup) {
            break;
         }
      }
   }
}
/**
 * @callback eachPropertyCallback
 * @param value - the value of the property
 * @param {string} key - the key of the property
 * @returns {undefined | boolean} if returns true the iteration breaks up immediately
 */


/**
 * Merges a variable list of inputs into the given mergeInto object.
 * Objects from later arguments overrides properties from earlier Objects
 *
 * @param {object} mergeInto - the object to merge into
 * @param {...object} objects - the objects to merge
 * @returns {object} the merged object
 */
function merge(mergeInto) {
   'use strict';

   each(arguments, function (argument, index) {
      if (index > 0) {

         eachProperty(argument, function (value, key) {
            mergeInto[key] = value;
         });
      }
   });

   return mergeInto;
}
