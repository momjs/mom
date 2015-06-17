/*exported modulesCreator */
function modulesCreator(partAccess, eventBus, loadedModules, settings) {
   'use strict';

  var availableModuleDescriptors = {},
      calledPostConstructs = [];

  return {
    provisionModule: initializeModules,
    unloadModules: unloadModules,
    provisionFinished: callPostConstructs,
    addModuleDescriptor: addModuleDescriptor,
    getModuleDescriptor: getModuleDescriptor
  };

  /////////////////////////////////////////////////////////////////////////

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
         moduleName = moduleDescriptor.name,
         actualSelector = settings.getModuleSettingsSelector(moduleName),
         domSettings = getDOMSettings(element, actualSelector, moduleDescriptor.name),
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

      if (createdModule !== undefined) {

         loadedModules.add(element, createdModule);

         //add module to eventBus
         eventBus.add(createdModule);
      }
   }

   function callPostConstructs() {
      each(loadedModules, function (module) {
         callPostConstruct(module);
      });
   }

   function callPostConstruct(module) {
      var postConstruct = module.postConstruct;
      if (typeof postConstruct === 'function') {
         if (!contains(calledPostConstructs, postConstruct)) {
            postConstruct();
            calledPostConstructs.push(postConstruct);
         }
      }
   }

   function unloadModules(element) {
      var modulesToUnload = loadedModules.get(element);

      each(modulesToUnload, function (module) {

         if (typeof module.preDestruct === 'function') {
            module.preDestruct();
         }
      });

      each(modulesToUnload, function (module) {
         eventBus.remove(module);
      });

      loadedModules.remove(element);
   }

   function getModuleDescriptor(moduleName) {
      var descriptor = availableModuleDescriptors[moduleName];
      if(!descriptor) {
        throw new Error('tried to load ' + moduleName + ' module descriptor, but was not registered');
      }

      return descriptor;
   }
}
