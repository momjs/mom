/*exported modules */
function modules(partAccess, eventBus, moduleSystemSettings) {
   'use strict';

   var loadedModules = [],
      availableModuleDescriptors = {};

   function addModuleDescriptor(moduleDescriptor) {
      availableModuleDescriptors[moduleDescriptor.name] = moduleDescriptor;
   }

   function initializeModules(element) {
      var moduleNames = element.getAttribute(moduleSystemSettings.attribute),
         moduleNamesArray = moduleNames.split(',');

      each(moduleNamesArray, function (index, moduleName) {
         moduleName = moduleName.trim();
         initializeModule(element, moduleName);
      });
   }

   function initializeModule(element, moduleName) {
      var moduleDescriptor,
         foundDependencies;

      //check if module to be loaded is registered
      try {
         if (availableModuleDescriptors.hasOwnProperty(moduleName)) {
            moduleDescriptor = availableModuleDescriptors[moduleName];

            foundDependencies = partAccess.getParts(moduleDescriptor.dependencies);

            buildModule(element, moduleDescriptor, foundDependencies);
         } else {
            console.error('Module', moduleName, 'not registered but found in dom');
         }
      } catch (e) {
         switch (e.name) {
         case 'SettingsParseException':
            console.error('Wrong formatted JSON in DOM for module', moduleDescriptor.name, 'message:', e.message);
            break;
         case 'PartCreationException':
            doTrace(e);
            break;
         default:
            console.error('Error during provision of module', moduleDescriptor, e.stack);
         }

      }


      function doTrace(e) {
         var currentException = e;

         if (console.group) {
            console.group();
         }

         console.error(e.message, 'while loading module', moduleDescriptor);

         do {
            console.error('... while loading part', currentException.descriptor);
            currentException = currentException.cause;
         } while (currentException.cause !== undefined);

         console.error('caused by:', currentException.stack);

         if (console.groupEnd) {
            console.groupEnd();
         }
      }
   }

   function buildModule(element, moduleDescriptor, foundDependencies) {
      var args = foundDependencies,
         domSettings = getDOMSettings(element, moduleDescriptor.name),
         mergedSettings,
         createdModule;

      if (moduleDescriptor.settings !== undefined || domSettings !== undefined) {
         //override module settings with found dom settings into new object
         mergedSettings = merge({}, moduleDescriptor.settings, domSettings);

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

   function getDOMSettings(element, moduleName) {

      var selector = moduleSystemSettings.settingsSelector.replace(/%moduleName%/g, moduleName),
         settingsScript = element.querySelector(selector),
         settingsAsHtml,
         settings;

      if (settingsScript !== null) {
         settingsAsHtml = settingsScript.innerHTML;
         try {
            settings = JSON.parse(settingsAsHtml);
         } catch (e) {
            throw {
               name: 'SettingsParseException',
               message: e.message
            };
         }
      }

      return settings;
   }

   function callPostConstructs() {

      each(loadedModules, function (index, element) {
         var postConstruct = element.postConstruct;

         if (typeof postConstruct === 'function') {

            postConstruct.call(element);
         }
      });
   }




   return {
      provisionModule: initializeModules,
      provisionFinished: callPostConstructs,
      addModuleDescriptor: addModuleDescriptor
   };
}
