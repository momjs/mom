/*exported partsCreator */
function partsCreator(settings) {
   'use strict';

   var loadedSingletonParts = {},
      loadedParts = [],
      buildingParts = {},
      availablePartDescriptors = {};

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

      getOrInitializeParts(eagerSingletonPartNames);
   }


   function getOrInitializeParts(partNames) {
      var parts = [];

      each(partNames, function (partName) {
         var part = getOrInitializePart(partName);
         parts.push(part);
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
         throw new Error('Circular dependency detected for part [' + partName + ']');
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
      var partName = partDescriptor.name,
         actualSelector = settings.getPartSettingsSelector(partName),
         domSettings = getDOMSettings(document, actualSelector, partDescriptor.name),
         mergedSettings = {},
         dependencies,
         foundDependencies,
         args,
         createdPart;

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


   }



   function callPostConstructs() {
      eachProperty(loadedParts, function (part) {
         callPostConstruct(part);
      });
   }

   function callPostConstruct(part) {
      if (typeof part.postConstruct === 'function') {
         part.postConstruct();

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


   return {
      initEagerSingletons: initEagerSingletons,
      provisionPart: provisionPart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };
}