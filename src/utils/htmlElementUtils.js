/* exported matchesSelector */

/**
 * Test if the given element matches the given selector
 *
 * @param {element} element - to test
 * @param {String} selector
 * @returns {boolean} true when element matches selector
 */
var matchesSelector = (function () {
   'use strict';

   var ElementPrototype = Element.prototype,
      nativeFunction = ElementPrototype.matches ||
      ElementPrototype.matchesSelector ||
      ElementPrototype.mozMatchesSelector ||
      ElementPrototype.msMatchesSelector ||
      ElementPrototype.oMatchesSelector ||
      ElementPrototype.webkitMatchesSelector;

   function nativeCall(element, selector) {
      return nativeFunction.call(element, selector);
   }

   function polyfill(element, selector) {
      var parentElement = element.parentNode || element.document,
         selectedElements = parentElement.querySelectorAll(selector);

      return contains(selectedElements, element);
   }

   return (nativeFunction) ? nativeCall : polyfill;
})();
