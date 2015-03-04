/* jshint unused:false */

/**
 * Iterates over all own properties of the specified object.
 * @param object
 * @param callback the callback function which will be called for each property key and value
 */
function eachProperty(object, callback) {
    'use strict';

    var propertyKey,
        propertyValue,
        breakup;

    for(propertyKey in object) {
        if(object.hasOwnProperty(propertyKey)) {

            propertyValue = object[propertyKey];
            breakup = callback(propertyKey, propertyValue);

            if(breakup) {
                break;
            }
        }
    }
}

function merge() {
   var mergeInto = arguments[0];

   each(arguments, function (index, argument) {
      if (index > 0) {

         eachProperty(argument, function (key, value) {
            mergeInto[key] = value;
         });
      }
   });

   return mergeInto;
}
