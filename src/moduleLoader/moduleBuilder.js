/* global moduleBuilder:true */
/* jshint unused:false */
var moduleBuilder = function (moduleAccess, partAccess) {
   'use strict';

   function create(store) {
      return function (name) {
         if (typeof name !== 'string') {
            throw new Error('Name missing');
         }
         var dependencies = [];
         var settings;


         function add(creator) {
            var descriptor = {
               creator: creator,
               name: name,
               dependencies: dependencies,
               settings: settings
            };
            store(descriptor);
         }

         function addSettings(neededSettings) {
            settings = neededSettings;

            return {
               dependencies: addDependencies,
               creator: add
            };
         }


         function addDependencies(neededParts) {

            dependencies = neededParts;

            return {
               settings: addSettings,
               creator: add
            };
         }

         return {
            settings: addSettings,
            dependencies: addDependencies,
            creator: add
         };
      };
   }

   return {
      createPart: create(partAccess.addPartDescriptor),
      createModule: create(moduleAccess.addModuleDescriptor)
   };
};
