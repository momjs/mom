/* exported modules */
function modules(partAccess, eventBus, settings) {
   'use strict';

   var loadedModules = loadedModulesContainer(),
      availableModuleDescriptors = {};

   function addModuleDescriptor(moduleDescriptor) {
      availableModuleDescriptors[moduleDescriptor.name] = moduleDescriptor;
   }

   function initializeModules(element) {
      var moduleNames = element.getAttribute(settings.attribute),
         moduleNamesArray = moduleNames.split(','),
         initializedModules = [],
         initializedModule;

      each(moduleNamesArray, function (moduleName) {
         moduleName = trim(moduleName);
         initializedModule = initializeModule(element, moduleName);

         initializedModules.push(initializedModule);
      });

      return initializedModules;
   }

   function initializeModule(element, moduleName) {
      var moduleDescriptor,
         foundDependencies;

      //check if module to be loaded is registered
      try {
         if (availableModuleDescriptors.hasOwnProperty(moduleName)) {
            moduleDescriptor = availableModuleDescriptors[moduleName];

            foundDependencies = partAccess.getParts(moduleDescriptor.dependencies);

            return buildModule(element, moduleDescriptor, foundDependencies);
         } else {
            settings.logger('Module', moduleName, 'not registered but found in dom');
         }
      } catch (e) {
         switch (e.name) {
         case 'SettingsParseException':
            settings.logger('Wrong formatted JSON in DOM for module', moduleDescriptor.name, 'message:', e.message);
            break;
         case 'PartCreationException':
            doTrace(e);
            break;
         default:
            settings.logger('Error during provision of module', moduleDescriptor, e.stack);
         }
      }

      function doTrace(e) {
         var currentException = e;

         if (console.group) {
            console.group();
         }

         settings.logger(e.message, 'while loading module', moduleDescriptor);

         do {
            settings.logger('... while loading part', currentException.descriptor);
            currentException = currentException.cause;
         } while (currentException.cause !== undefined);

         settings.logger('caused by:', currentException.stack);

         if (console.groupEnd) {
            console.groupEnd();
         }
      }
   }

   function buildModule(element, moduleDescriptor, foundDependencies) {
      var args = foundDependencies,
         domSettings = getDOMSettings(element, settings.moduleSettingsSelector.replace(/%moduleName%/g, moduleDescriptor.name)),
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

      return createdModule;
   }

   function postConstruct(module) {
      if (typeof module.postConstruct === 'function') {
         try {
            module.postConstruct();
         } catch (e) {
            settings.logger('Exception while calling postConstruct', e);
         }
      }
   }

   function callPostConstructs() {

      each(loadedModules, function (module) {
         postConstruct(module);
      });
   }

   function unloadModules(element) {
      var modulesToUnload = loadedModules.get(element);

      each(modulesToUnload, function(module) {

         if(typeof module.preDestruct === 'function') {
            try {
               module.preDestruct();
            } catch (e) {
               settings.logger('Exception while calling preDestruct', e);
            }
         }
      });

      each(modulesToUnload, function(module) {

         eventBus.remove(module);
      });

      loadedModules.remove(element);
   }

   return {
      provisionModule: initializeModules,
      unloadModules: unloadModules,
      provisionFinished: callPostConstructs,
      postConstruct: postConstruct,
      addModuleDescriptor: addModuleDescriptor
   };
}
