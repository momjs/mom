/* global moduleSettings:true */
/* jshint unused:false */
var settings = function () {
   'use strict';

   var defaults = {
         defaultScope: 'default',
         attribute: 'modules',
         selector: '[modules]'
      },
      settings = defaults;

   function mergeWith(newSettings) {
      merge(settings, newSettings);
   }


   function get() {
      return settings;
   }

   return {
      get: get,
      mergeWith: mergeWith
   };
};