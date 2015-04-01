/*exported modules */
function modules(partAccess, eventBus, settings) {
   'use strict';

   var loadedModules = [],
      availableModuleDescriptors = {};

   function addModuleDescriptor(moduleDescriptor) {
      availableModuleDescriptors[moduleDescriptor.name] = moduleDescriptor;
   }

   function initializeModules(element) {
      var moduleNames = element.getAttribute(settings.attribute),
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

      var selector = settings.settingsSelector.replace(/%moduleName%/g, moduleName),
         settingsScript = element.querySelector(selector),
         settingsAsHtml,
         domSettings;

      if (settingsScript !== null) {
         settingsAsHtml = settingsScript.innerHTML;
         try {
            domSettings = JSON.parse(settingsAsHtml);
         } catch (e) {
            throw new SettingsParseException(e.message);
         }
      }

      return domSettings;
   }

   function callPostConstructs() {

      each(loadedModules, function (index, element) {
         var postConstruct = element.postConstruct;

         if (typeof postConstruct === 'function') {

            postConstruct.call(element);
         }
      });
   }

   function SettingsParseException(message) {
      if (Error.captureStackTrace) {
         Error.captureStackTrace(this);
      }
      this.name = 'SettingsParseException';
      this.message = message;

   }
   SettingsParseException.prototype = Error.prototype;




   return {
      provisionModule: initializeModules,
      provisionFinished: callPostConstructs,
      addModuleDescriptor: addModuleDescriptor
   };
}