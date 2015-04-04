/*exported modules */
function modules(partAccess, eventBus, settings) {
   'use strict';

   var loadedModules = loadedModulesContainer(),
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

      if (createdModule === undefined) {
         createdModule = {};
      }

      //loadedModules.push(createdModule);
      loadedModules.add(element, createdModule);

      //add module to eventBus
      eventBus.add(createdModule);
   }

   function callPostConstructs() {

      each(loadedModules, function (module) {
         if (typeof module.postConstruct === 'function') {
            try {
               module.postConstruct();
            } catch (e) {
               settings.logger('Exception while calling postConstruct', e);
            }
         }
      });
   }

   function unloadModules(element) {

      var modulesToUnload = loadedModules.get(element);

      each(modulesToUnload, function(module) {

         eventBus.remove(module);
      });

      loadedModules.remove(element);
   }

   return {
      provisionModule: initializeModules,
      unloadModules: unloadModules,
      provisionFinished: callPostConstructs,
      addModuleDescriptor: addModuleDescriptor
   };

   function loadedModulesContainer() {

      var JOJ_ID_ATTRIBUTE_NAME = 'joj-id',
         modulesMap = {},
         modules = [],
         createJojId = (function() {
            var currentId = 0;

            return function() {
               return ++currentId;
            };
         })();

      function add(element, module) {
         var modulesListForElement,
            elementJojId = estimateElementsJojId(element);

         if(modulesMap.hasOwnProperty(elementJojId)) {
            modulesListForElement = modulesMap[elementJojId];
         }
         else {
            modulesListForElement = [];
            modulesMap[elementJojId] = modulesListForElement;
         }

         modulesListForElement.push(module);
         modules.push(module);
      }

      function estimateElementsJojId(element) {
         var elementJojId;

         if (element.hasAttribute(JOJ_ID_ATTRIBUTE_NAME)) {
            elementJojId = element.getAttribute(JOJ_ID_ATTRIBUTE_NAME);
         }
         else {
            elementJojId = createJojId();
            element.setAttribute(JOJ_ID_ATTRIBUTE_NAME, elementJojId);
         }

         return elementJojId;
      }

      function removeElement(element) {
         var elementJojId;

         if(element.hasAttribute(JOJ_ID_ATTRIBUTE_NAME)) {
            elementJojId = element.getAttribute(JOJ_ID_ATTRIBUTE_NAME);

            if(modulesMap.hasOwnProperty(elementJojId)) {
               delete modulesMap[elementJojId];
            }
         }
      }

      function getByElement(element) {
         var elementJojId = element.getAttribute(JOJ_ID_ATTRIBUTE_NAME);
         return modulesMap[elementJojId];
      }

      modules.add = add;
      modules.remove = removeElement;
      modules.get = getByElement;

      return modules;
   }
}