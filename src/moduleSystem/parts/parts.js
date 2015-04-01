/*exported parts */
function parts(settings) {
   'use strict';

   var loadedSingletonParts = {},
      loadedParts = [],
      availablePartDescriptors = {};

   function addPartDescriptor(partDescriptor) {
      availablePartDescriptors[partDescriptor.name] = partDescriptor;
   }

   function initEagerSingletons() {
      var eagerSingletonPartNames = [];

      eachProperty(availablePartDescriptors, function (partName, partDescriptor) {
         if (partDescriptor.scope === constants.scope.eagerSingleton) {
            eagerSingletonPartNames.push(partDescriptor.name);
         }
      });

      getOrInitializeParts(eagerSingletonPartNames, true);
   }


   function getOrInitializeParts(partNames, suppressErrors) {
      var parts = [];

      each(partNames, function (index, partName) {
         try {
            var part = getOrInitializePart(partName);
            parts.push(part);
         } catch (e) {
            if (suppressErrors) {
               settings.logger(e);
            } else {
               throw e;
            }
         }
      });

      return parts;
   }

   function getOrInitializePart(partName) {
      var partDescriptor,
         constructionStrategy,
         part;

      if (availablePartDescriptors.hasOwnProperty(partName)) {
         partDescriptor = availablePartDescriptors[partName];
         constructionStrategy = getConstructionStrategie(partDescriptor.scope);
         part = constructionStrategy(partDescriptor);

      } else {
         throw new Error('tried to load ' + partName + ' but was not registered');
      }

      return part;
   }

   function getConstructionStrategie(scope) {
      switch (scope) {
      case constants.scope.multiInstance:
         return multiInstanceConstructionStrategy;
      case constants.scope.lazySingleton:
      case constants.scope.eagerSingleton:
         return singletonConstructionStrategy;
      default:
         throw new Error('unknown scope [' + scope + ']');
      }
   }

   function multiInstanceConstructionStrategy(partDescriptor) {
      var part,
         builder = getBuilder(partDescriptor.type);

      part = builder(partDescriptor);

      loadedParts.push(part);

      return part;
   }

   function singletonConstructionStrategy(partDescriptor) {
      var partName = partDescriptor.name,
         part = loadedSingletonParts[partName];

      if (part === undefined) {
         part = multiInstanceConstructionStrategy(partDescriptor);
         loadedSingletonParts[partName] = part;
      }

      return part;
   }


   function getBuilder(type) {
      switch (type) {
      case constants.type.returns:
         return buildReturnsPart;
      case constants.type.creator:
         return buildCreatorPart;
      default:
         throw new Error('unknown type [' + type + ']');
      }
   }

   function buildReturnsPart(partDescriptor) {
      return partDescriptor.returns;
   }

   function buildCreatorPart(partDescriptor) {
      var dependencies,
         foundDependencies,
         args,
         createdPart;
      try {
         dependencies = partDescriptor.dependencies;
         foundDependencies = getOrInitializeParts(dependencies);

         //initialize Parts here
         args = foundDependencies;
         // add settings from descriptor
         if (partDescriptor.settings !== undefined) {
            args.unshift(partDescriptor.settings);
         }

         // create part
         createdPart = partDescriptor.creator.apply(partDescriptor, args);

         if (createdPart === undefined) {
            createdPart = {};
         }

         return createdPart;
      } catch (e) {
         switch (e.name) {
         case 'RangeError':
            throw e;
         default:
            throw new PartCreationException(partDescriptor, e);
         }
      }

   }


   function callPostConstructs() {
      eachProperty(loadedParts, function (i, part) {
         callPostConstruct(part);
      });
   }

   function callPostConstruct(part) {
      if (typeof part.postConstruct === 'function') {
         try {
            part.postConstruct();
         } catch (e) {
            settings.logger('Exception while calling postConstruct', e);
         }

         //delete post constructor so it can definetly not be called again
         //e.g. a singleton part is requested via provisionPart
         delete part.postConstruct;
      }
   }

   function provisionPart(partName) {
      var part = getOrInitializePart(partName);
      callPostConstruct(part);

      return part;
   }

   function PartCreationException(descriptor, cause) {
      if (Error.captureStackTrace) {
         Error.captureStackTrace(this);
      }
      this.name = 'PartCreationException';
      this.cause = cause;
      this.descriptor = descriptor;

   }
   PartCreationException.prototype = Error.prototype;


   return {
      initEagerSingletons: initEagerSingletons,
      provisionPart: provisionPart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };
}