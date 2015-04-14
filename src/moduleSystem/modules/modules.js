/*exported modulesCreator */
function modulesCreator(partAccess, eventBus, settings) {
   'use strict';

   var loadedModules = [],
      availableModuleDescriptors = {};

   function addModuleDescriptor(moduleDescriptor) {
      availableModuleDescriptors[moduleDescriptor.name] = moduleDescriptor;
   }

   function initializeModules(element) {
      var moduleNames = element.getAttribute(settings.attribute),
         moduleNamesArray = moduleNames.split(',');

      each(moduleNamesArray, function (moduleName) {
         moduleName = trim(moduleName);
         initializeModule(element, moduleName);
      });
   }

   function initializeModule(element, moduleName) {
      var moduleDescriptor,
         foundDependencies;

      //check if module to be loaded is registered
      if (availableModuleDescriptors.hasOwnProperty(moduleName)) {
         moduleDescriptor = availableModuleDescriptors[moduleName];

         foundDependencies = partAccess.getParts(moduleDescriptor.dependencies);

         buildModule(element, moduleDescriptor, foundDependencies);
      } else {
         throw new Error('Module [' + moduleName + '] not created but found in dom');

      }
   }


   function buildModule(element, moduleDescriptor, foundDependencies) {
      var args = foundDependencies,
         domSettings = getDOMSettings(element, settings.moduleSettingsSelector, moduleDescriptor.name),
         mergedSettings = {},
         createdModule;

      if (moduleDescriptor.settings !== undefined || domSettings !== undefined) {
         //override module settings with found dom settings into new object
         merge(mergedSettings, moduleDescriptor.settings, domSettings);

         args.unshift(mergedSettings);
      }

      //make moduleDomElement first arguments
      args.unshift(element);

      //create Module
      createdModule = moduleDescriptor.creator.apply(moduleDescriptor, args);

      if (createdModule === undefined) {
         createdModule = {};
      }

      loadedModules.push(createdModule);

      //add module to eventBus
      eventBus.add(createdModule);
   }


   function callPostConstructs() {
      each(loadedModules, function (module) {
         if (typeof module.postConstruct === 'function') {
            module.postConstruct();
         }
      });
   }

   return {
      provisionModule: initializeModules,
      provisionFinished: callPostConstructs,
      addModuleDescriptor: addModuleDescriptor
   };
}