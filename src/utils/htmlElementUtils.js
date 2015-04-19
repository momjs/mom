/* exported matchesSelector */
var matchesSelector = (function() {
   'use strict';

   var ElementPrototype = Element.prototype,
      nativeFunction = ElementPrototype.matchesSelector ||
         ElementPrototype.mozMatchesSelector ||
         ElementPrototype.msMatchesSelector ||
         ElementPrototype.oMatchesSelector ||
         ElementPrototype.webkitMatchesSelector;

   function nativeCall(element, selector) {
      return nativeFunction.call(element, selector);
   }

   function polyfill(element, selector) {
      var parentElement = element.parentNode || element.document,
         selectedElements = parentElement.querySelectorAll(selector),
         i = -1;

      /* jshint noempty: false */
      while (selectedElements[++i] && selectedElements[i] !== element){}

      return !!selectedElements[i];
   }

   return (nativeFunction) ? nativeCall : polyfill;
})();
