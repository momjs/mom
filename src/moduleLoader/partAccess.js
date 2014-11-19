/* global partAccess:true */
/* jshint unused:false */
var partAccess = function () {
   'use strict';

   var loadedParts = {},
      availablePartDescriptors = {};

   function addPartDescriptor(partDescriptor) {
      availablePartDescriptors[partDescriptor.name] = partDescriptor;
   }

   function getOrInitializeParts(partNames) {
      var parts = [],
         i,
         partName;

      for (i = 0; i < partNames.length; i++) {
         partName = partNames[i];
         parts.push(getOrInitializePart(partName));
      }


      return parts;
   }


   function getOrInitializePart(partName) {
      var part = loadedParts[partName];
      if (part === undefined) {
         part = initialize(partName);
      }

      return part;
   }

   function initialize(partName) {
      var dependencies,
         foundDependencies,
         partDescriptor;

      if (availablePartDescriptors.hasOwnProperty(partName)) {
         partDescriptor = availablePartDescriptors[partName];
         dependencies = partDescriptor.dependencies;
         foundDependencies = getOrInitializeParts(dependencies);

         return buildPart(partDescriptor, foundDependencies);
      } else {
         throw new Error('tried to load ' + partName + 'but was not registered');
      }
   }

   function buildPart(partDescriptor, dependencies) {
      var args,
         createdPart;

      //initialize Parts here
      args = dependencies;
      // add settings from descriptor
      if (partDescriptor.settings !== undefined) {
         args.unshift(partDescriptor.settings);
      }

      // create part
      createdPart = partDescriptor.creator.apply(null, args);

      if (createdPart === undefined) {
         createdPart = {};
      }

      loadedParts[partDescriptor.name] = createdPart;

      return createdPart;
   }


   function callPostConstructs() {
      callPostConstruct(loadedParts);

      function callPostConstruct(store) {
         var elementName,
            element;

         for (elementName in store) {
            if (store.hasOwnProperty(elementName)) {
               element = store[elementName];
               if (typeof element.postConstruct === 'function') {
                  element.postConstruct();
               }
            }

         }
      }
   }

   function reset() {
      loadedParts = {};
      availablePartDescriptors = {};
   }

   return {
      reset: reset,
      provisionPart: getOrInitializePart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };
};