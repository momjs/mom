/*exported partBuilder */
function partBuilder(partAccess, moduleSystemSettings) {
   'use strict';

   var scopes = constants.scope,
      SCOPE_LAZY_SINGLETON = scopes.lazySingleton,
      SCOPE_EAGER_SINGLETON = scopes.eagerSingleton,
      SCOPE_MULTI_INSTANCE = scopes.multiInstance;

   function returnsDescriptor(name) {
      var descriptor = createDescriptor(name);

      descriptor.type = constants.type.returns;
      descriptor.scope = SCOPE_LAZY_SINGLETON;
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

         if(typeof creator !== 'function') {
            throw new Error('You have to pass the creator as a reference to a function');
         }

         getOrInitCreatorDiscriptor().creator = creator;
         save();
      }

      function addReturns(returns) {

         if(returns === undefined) {

            throw new Error('You have to pass the returns as one of these object types: string|integer|float|boolean|object|function|Array');
         }

         descriptor = returnsDescriptor(name);
         descriptor.returns = returns;
         save();
      }

      function addScope(scope) {

         if(SCOPE_LAZY_SINGLETON !== scope && SCOPE_EAGER_SINGLETON !== scope && SCOPE_MULTI_INSTANCE !== scope) {
            throw new Error('You have to pass the scope as one of these: lazy-singleton|eager-singleton|multi-instance');
         }

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

         if(settings !== undefined && typeof settings !== 'object') {
            throw new Error('You have to pass the settings as an object');
         }

         getOrInitCreatorDiscriptor().settings = settings;

         return {
            dependencies: addDependencies,
            creator: addCreator,
            scope: addScope
         };
      }

      function addDependencies(dependencies) {

         if(dependencies !== undefined && !isArray(dependencies) ) {
            throw new Error('You have to pass the dependencies as an Array');
         }

         getOrInitCreatorDiscriptor().dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator,
            scope: addScope
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
