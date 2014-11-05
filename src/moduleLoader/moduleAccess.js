/* global moduleAccess:true */
/* jshint unused:false */
var moduleAccess = function (partAccess, eventBus) {
   'use strict';

   var loadedModules = {},
      availableModuleDescriptors = {};


   function addModuleDescriptor(moduleDescriptor) {
      availableModuleDescriptors[moduleDescriptor.name] = moduleDescriptor;
   }


   function initializeModules(element) {
      var moduleNames = element.getAttribute('modules'),
          moduleNamesArray = moduleNames.split(','),
          i,
          moduleName;

      for(i = 0; i < moduleNamesArray.length; i++) {
         moduleName = moduleNamesArray[i].trim();
         initializeModule($(element), moduleName);
      }
   }
   
   function initializeModule($element, moduleName) {
      var moduleDescriptor,
          foundDependencies;

      //check if module to be loaded is registered
      if (availableModuleDescriptors.hasOwnProperty(moduleName)) {
         moduleDescriptor = availableModuleDescriptors[moduleName];

         foundDependencies = partAccess.getParts(moduleDescriptor.dependencies);
         // check if all needed dependencies are found
         if (foundDependencies.length === moduleDescriptor.dependencies.length) {
            buildModule($element, moduleDescriptor, foundDependencies);
         } else {
            throw new Error('Required Parts Missing from ' + moduleName + ' dependencies: ' + JSON.stringify(moduleDescriptor.dependencies));
         }
      } else {
         throw new Error('Module ' + moduleName + ' not registered but found in dom');
      }
   }

   function buildModule($element, moduleDescriptor, foundDependencies) {
      //build arguments
      var args = foundDependencies,
         domSettings = getDOMSettings($element, moduleDescriptor.name),
         mergedSettings,
         createdModule,
         name;

      if (moduleDescriptor.settings !== undefined || domSettings !== undefined) {
         //override module settings with found dom settings into new object
         mergedSettings = $.extend({}, moduleDescriptor.settings, domSettings);

         args.unshift(mergedSettings);
      }

      //make moduleDomElement first arguments
      args.unshift($element.get(0));

      //create Module
      createdModule = moduleDescriptor.creator.apply(null, args);

      if (createdModule === undefined) {
         createdModule = {};
      }

      //increment module name if a module is found multiple times
      name = getIncrementedModuleName(moduleDescriptor.name);

      createdModule.name = name;
      loadedModules[name] = createdModule;

      //add module to eventBus
      eventBus.add(createdModule);
   }


   function getDOMSettings($element, moduleName) {

      var $settingsScript = $element.find('script[type="' + moduleName + '/settings"]'),
         settingsAsHtml = $settingsScript.html();

      if (settingsAsHtml !== undefined) {
         return $.parseJSON(settingsAsHtml);
      }
   }


   function getIncrementedModuleName(name) {
      var i = 0;
      var foundName;

      do {
         foundName = name + i;
         i++;
      } while (loadedModules.hasOwnProperty(foundName));

      return foundName;
   }

   function callPostConstructs() {
      callPostConstruct(loadedModules);

      function callPostConstruct(store) {
         $.each(store, function (i, element) {
            if (typeof element.postConstruct === 'function') {
               element.postConstruct();
            }
         });
      }
   }

   function reset() {
      loadedModules = {};
      availableModuleDescriptors = {};
   }


   return {
      reset: reset,
      provisionModule: initializeModules,
      provisionFinished: callPostConstructs,
      addModuleDescriptor: addModuleDescriptor
   };
};