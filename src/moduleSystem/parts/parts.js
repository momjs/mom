/*exported parts */
function parts(settings) {
   'use strict';

   var loadedSingletonParts = {},
      loadedParts = [],
      buildingParts = {},
      availablePartDescriptors = {},
      BUILDING = 1;

   function addPartDescriptor(partDescriptor) {
      availablePartDescriptors[partDescriptor.name] = partDescriptor;
   }

   function initEagerSingletons() {
      var eagerSingletonPartNames = [];

      eachProperty(availablePartDescriptors, function (partDescriptor, partName) {
         if (partDescriptor.scope === constants.scope.eagerSingleton) {
            eagerSingletonPartNames.push(partName);
         }
      });

      getOrInitializeParts(eagerSingletonPartNames, true);
   }


   function getOrInitializeParts(partNames, suppressErrors) {
      var parts = [];

      each(partNames, function (partName) {
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
         buildingStart(partName);

         partDescriptor = availablePartDescriptors[partName];
         constructionStrategy = getConstructionStrategie(partDescriptor.scope);
         part = constructionStrategy(partDescriptor);

         buildingFinished(partName);
      } else {
         throw new Error('tried to load ' + partName + ' but was not registered');
      }

      return part;
   }

   function buildingStart(partName) {
      var INDICATEBUILDING = true;
      if (buildingParts.hasOwnProperty(partName)) {
         throw new CircularDependencyException(partName);
      } else {
         buildingParts[partName] = INDICATEBUILDING;
      }
   }

   function buildingFinished(partName) {
      delete buildingParts[partName];
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
      var domSettings = getDOMSettings(document, settings.partSettingsSelector.replace(/%partName%/g, partDescriptor.name)),
         mergedSettings = {},
         dependencies,
         foundDependencies,
         args,
         createdPart;
      try {
         dependencies = partDescriptor.dependencies;
         foundDependencies = getOrInitializeParts(dependencies);

         //initialize Parts here
         args = foundDependencies;
         // add settings from descriptor
         if (partDescriptor.settings !== undefined || domSettings !== undefined) {
            merge(mergedSettings, partDescriptor.settings, domSettings);
            args.unshift(mergedSettings);
         }

         // create part
         createdPart = partDescriptor.creator.apply(partDescriptor, args);

         if (createdPart === undefined) {
            createdPart = {};
         }

         return createdPart;
      } catch (e) {
         switch (e.name) {
         case 'CircularDependencyException':
            throw e;
         default:
            throw new PartCreationException(partDescriptor, e);
         }
      }

   }



   function callPostConstructs() {
      eachProperty(loadedParts, function (part) {
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

   function CircularDependencyException(partName) {
      if (Error.captureStackTrace) {
         Error.captureStackTrace(this);
      }
      this.name = 'CircularDependencyException';
      this.message = 'Circular dependency detected for ' + partName;
   }
   CircularDependencyException.prototype = Error.prototype;


   return {
      initEagerSingletons: initEagerSingletons,
      provisionPart: provisionPart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };
}