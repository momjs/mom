/*exported moduleBuilder */
function moduleBuilder(moduleAccess) {
   'use strict';

   function createModule(name) {
      var descriptor = creatorDescriptor(name);

      return {
         settings: addSettings,
         dependencies: addDependencies,
         creator: addCreator
      };

      function addCreator(creator) {

         if(typeof creator !== 'function') {
            throw new Error('You have to pass the creator as a reference to a function');
         }

         descriptor.creator = creator;
         save();
      }

      function addSettings(settings) {

         if(settings !== undefined && typeof settings !== 'object') {
            throw new Error('You have to pass the settings as an object');
         }

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

         if(dependencies !== undefined && !isArray(dependencies) ) {
            throw new Error('You have to pass the dependencies as an Array');
         }

         descriptor.dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator
         };
      }
   }

   return createModule;
}
