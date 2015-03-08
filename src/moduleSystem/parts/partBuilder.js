/*exported partBuilder */
function partBuilder(partAccess, moduleSystemSettings) {
   'use strict';

   function returnsDescriptor(name) {
      var descriptor = createDescriptor(name);
      descriptor.type = constants.type.returns;

      descriptor.scope = constants.scope.singleton;

      descriptor.returns = undefined;

      return descriptor;
   }

   function partDescriptor(name) {
      var descriptor = creatorDescriptor(name);
      descriptor.scope = moduleSystemSettings.defaultScope;

      return descriptor;
   }


   function createPart(name) {
      var descriptor;

      return {
         settings: addSettings,
         dependencies: addDependencies,
         creator: addCreator,
         returns: addReturns,
         scope: addScope
      };

      function addCreator(creator) {
         getOrInitCreatorDiscriptor().creator = creator;
         save();
      }

      function addReturns(returns) {
         descriptor = returnsDescriptor(name);
         descriptor.returns = returns;
         save();
      }

      function addScope(scope) {

         var descriptor = getOrInitCreatorDiscriptor();

         if (scope !== undefined) {
            descriptor.scope = scope;
         }

         return {
            settings: addSettings,
            dependencies: addDependencies,
            creator: addCreator,
            returns: addReturns
         };
      }

      function addSettings(settings) {
         getOrInitCreatorDiscriptor().settings = settings;

         return {
            dependencies: addDependencies,
            creator: addCreator
         };
      }

      function addDependencies(dependencies) {
         getOrInitCreatorDiscriptor().dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator
         };
      }

      function getOrInitCreatorDiscriptor() {
         if (descriptor === undefined) {
            descriptor = partDescriptor(name);
         }

         return descriptor;
      }

      function save() {
         partAccess.addPartDescriptor(descriptor);
      }
   }


   return createPart;
}