/* global partAccess:true */
/* jshint unused:false */
var partAccess = function () {
   'use strict';

   var loadedSingletonParts = {},
      loadedParts = [],
      availablePartDescriptors = {};

   function addPartDescriptor(partDescriptor) {
      availablePartDescriptors[partDescriptor.name] = partDescriptor;
   }

   function getOrInitializeParts(partNames) {
      var parts = [];

      each(partNames, function (index, partName) {
         parts.push(getOrInitializePart(partName));
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
      case 'default':
         return defaultConstructionStrategy;
      case 'singleton':
         return singletonConstructionStrategy;
      default:
         throw new Error('unknown scope [' + scope + ']');
      }
   }

   function defaultConstructionStrategy(partDescriptor) {
      var part = initialize(partDescriptor);
      loadedParts.push(part);

      return part;
   }

   function singletonConstructionStrategy(partDescriptor) {
      var partName = partDescriptor.name,
         part = loadedSingletonParts[partName];

      if (part === undefined) {
         part = defaultConstructionStrategy(partDescriptor);
         loadedSingletonParts[partName] = part;
      }

      return part;
   }

   function initialize(partDescriptor) {
      var dependencies,
         foundDependencies,
         builder;

      dependencies = partDescriptor.dependencies;
      foundDependencies = getOrInitializeParts(dependencies);

      builder = getBuilder(partDescriptor.type);

      return builder(partDescriptor, foundDependencies);

   }



   function getBuilder(type) {
      switch (type) {
      case 'returns':
         return buildReturnsPart;
      case 'creator':
         return buildCreatorPart;
      default:
         throw new Error('unknown type [' + type + ']');
      }
   }

   function buildReturnsPart(partDescriptor) {
      return partDescriptor.returns;
   }

   function buildCreatorPart(partDescriptor, dependencies) {
      var args,
         createdPart;

      //initialize Parts here
      args = dependencies;
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
   }


   function callPostConstructs() {
      callPostConstruct(loadedParts);

      function callPostConstruct(store) {

         eachProperty(store, function (elementName, element) {

            if (typeof element.postConstruct === 'function') {

               element.postConstruct();
            }
         });
      }
   }


   return {
      provisionPart: getOrInitializePart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };
};