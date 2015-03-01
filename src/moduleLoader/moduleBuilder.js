/* global moduleBuilder:true */
/* jshint unused:false */
var moduleBuilder = function (moduleAccess, partAccess) {
   'use strict';


   function createDescriptor(name) {
      if (typeof name !== 'string') {
         throw new Error('Name missing');
      }

      return {
         name: name
      };
   }

   function creatorDescriptor(name) {
      var descriptor = createDescriptor(name);
      descriptor.type = 'creator';
      descriptor.scope = 'default';
      descriptor.settings = undefined;
      descriptor.dependencies = [];
      descriptor.creator = undefined;

      return descriptor;
   }


   function returnsDescriptor(name) {
      var descriptor = creatorDescriptor(name);
      descriptor.type = 'returns';

      descriptor.returns = undefined;

      return descriptor;
   }


   function createModuleDescriptorBuilder(name) {
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


   function createPartDescriptorBuilder(name) {
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
            descriptor = creatorDescriptor(name);
         }

         return descriptor;
      }

      function save() {
         partAccess.addPartDescriptor(descriptor);
      }
   }


   return {
      createPart: createPartDescriptorBuilder,
      createModule: createModuleDescriptorBuilder
   };
};