/* global moduleBuilder:true */
/* jshint unused:false */
var moduleBuilder = function (moduleAccess) {
   'use strict';

   function createModule(name) {
      var descriptor = creatorDescriptor(name);

      return {
         settings: addSettings,
         dependencies: addDependencies,
         creator: addCreator
      };

      function addCreator(creator) {
         descriptor.creator = creator;
         save();
      }

      function addSettings(settings) {
         descriptor.settings = settings;

         return {
            dependencies: addDependencies,
            creator: addCreator
         };
      }

      function save() {
         moduleAccess.addModuleDescriptor(descriptor);
      }


      function addDependencies(dependencies) {
         descriptor.dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator
         };
      }
   }



   return createModule;
};