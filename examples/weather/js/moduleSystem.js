/**
 * moduleSystem
 * Dynamic Loading of Javascript based on DOM elements
 * @version v1.3.0 - 2015-04-03 * @link 
 * @author Eder Alexander <eder.alexan@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 *//* jshint ignore:start */
;
(function (window, document, undefined) {   
/* jshint ignore:end */

function SettingsParseException(message) {
   'use strict';
   if (Error.captureStackTrace) {
      Error.captureStackTrace(this);
   }
   this.name = 'SettingsParseException';
   this.message = message;

}
SettingsParseException.prototype = Error.prototype;

/*exported getDOMSettings */
function getDOMSettings(element, selector) {
   'use strict';

   var settingsScript = element.querySelector(selector),
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
/**
 * Iterates the array and callback function for each element.
 *
 * @param {Array} array the array to iterate
 * @param {function} callback the callback function:
 *      - first parameter delivers the current index, second the current element
 *      - if the callback function returns true the iteration breaks up immediately
 */
/*exported each */
function each(array, callback) {
   'use strict';

   var index,
      length = array.length,
      element,
      breakLoop;

   for (index = 0; index < length; index++) {
      element = array[index];

      breakLoop = callback(index, element);

      if (breakLoop) {
         break;
      }
   }
}

/**
 * Indicates if the specified element looking for is containing in the specified array.
 * @param array the array to lookup
 * @param elementToSearch the element to lookup
 * @returns {boolean} true if the array contains the element, false if not
 */
/*exported contains */
function contains(array, elementToSearch) {
   'use strict';

   var index,
      length = array.length,
      element,
      isContaining = false;

   for (index = 0; index < length; index++) {
      element = array[index];

      if (element === elementToSearch) {
         isContaining = true;
         break;
      }
   }

   return isContaining;
}

/**
 * Indicates if the passed object is an Array.
 *
 * @param object the object which will be checked to be an Array
 * @returns {boolean} true if the passed object is an Array, false if not
 */
/*exported isArray */
function isArray(object) {
   'use strict';

   return toString.call(object) === '[object Array]';
}
/**
 * Iterates over all own properties of the specified object.
 * @param object
 * @param callback the callback function which will be called for each property key and value
 */
/*exported eachProperty */
function eachProperty(object, callback) {
   'use strict';

   var propertyKey,
      propertyValue,
      breakup;

   for (propertyKey in object) {
      if (object.hasOwnProperty(propertyKey)) {

         propertyValue = object[propertyKey];
         breakup = callback(propertyKey, propertyValue);

         if (breakup) {
            break;
         }
      }
   }
}

/*exported merge */
function merge() {
   'use strict';

   var mergeInto = arguments[0];

   each(arguments, function (index, argument) {
      if (index > 0) {

         eachProperty(argument, function (key, value) {
            mergeInto[key] = value;
         });
      }
   });

   return mergeInto;
}
/* exported trim */
function trim(string) {
   'use strict';
   return string.replace(/^\s+|\s+$/g, '');
}
/*exported constants */
var constants = {
   scope: {
      lazySingleton: 'lazy-singleton',
      eagerSingleton: 'eager-singleton',
      multiInstance: 'multi-instance'
   },
   type: {
      returns: 'returns',
      creator: 'creator'
   }
};

/*exported settings */
function settings() {
   'use strict';

   var defaults = {
         rootNode: document,
         defaultScope: constants.scope.multiInstance,
         moduleSettingsSelector: 'script[type="%moduleName%/settings"]',
         partSettingsSelector: 'head script[type="%partName%/settings"]',
         attribute: 'modules',
         selector: '[%attribute%]',
         logger: console.error.bind(console)
      },
      actualSettings = defaults;

   function mergeWith(newSettings) {
      merge(actualSettings, newSettings);
   }


   function get() {
      return actualSettings;
   }

   return {
      get: get,
      mergeWith: mergeWith
   };
}
/*exported createDescriptor */
function createDescriptor(name) {
   'use strict';

   if (typeof name !== 'string') {
      throw new Error('Name missing');
   }

   return {
      name: name
   };
}

/*exported creatorDescriptor */
function creatorDescriptor(name) {
   'use strict';

   var descriptor = createDescriptor(name);
   descriptor.type = constants.type.creator;
   descriptor.settings = undefined;
   descriptor.dependencies = [];
   descriptor.creator = undefined;

   return descriptor;
}

/*exported moduleLoader */
function moduleLoader(moduleAccess, partAccess, settings) {
   'use strict';

   function initModulePage() {

      initModules();

      function initModules() {
         var selector = settings.selector.replace(/%attribute%/g, settings.attribute),
            modulesOnPage = settings.rootNode.querySelectorAll(selector);

         partAccess.initEagerSingletons();

         each(modulesOnPage, function (index, element) {
            initModule(element);
         });


         partAccess.provisionFinished();
         moduleAccess.provisionFinished();
      }

      function initModule(element) {
         moduleAccess.provisionModule(element);
      }
   }

   return {
      initModulePage: initModulePage
   };
}

/*exported moduleBuilder */
function moduleBuilder(moduleAccess) {
   'use strict';

   function createModule(name) {
      var descriptor = creatorDescriptor(name);

      return {
         settings: addSettings,
         dependencies: addDependencies,
         creator: addCreator
      };

      function addCreator(creator) {

         if(typeof creator !== 'function') {
            throw new Error('You have to pass the creator as a reference to a function');
         }

         descriptor.creator = creator;
         save();
      }

      function addSettings(settings) {

         if(settings !== undefined && typeof settings !== 'object') {
            throw new Error('You have to pass the settings as an object');
         }

         descriptor.settings = settings;

         return {
            dependencies: addDependencies,
            creator: addCreator
         };
      }

      function save() {
         moduleAccess.addModuleDescriptor(descriptor);
      }


      function addDependencies(dependencies) {

         if(dependencies !== undefined && !isArray(dependencies) ) {
            throw new Error('You have to pass the dependencies as an Array');
         }

         descriptor.dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator
         };
      }
   }

   return createModule;
}

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

      loadedModules.push(createdModule);

      //add module to eventBus
      eventBus.add(createdModule);


   }


   function callPostConstructs() {

      each(loadedModules, function (index, module) {
         if (typeof module.postConstruct === 'function') {
            try {
               module.postConstruct();
            } catch (e) {
               settings.logger('Exception while calling postConstruct', e);
            }
         }
      });
   }






   return {
      provisionModule: initializeModules,
      provisionFinished: callPostConstructs,
      addModuleDescriptor: addModuleDescriptor
   };
}
/*exported partBuilder */
function partBuilder(partAccess, moduleSystemSettings) {
   'use strict';

   var scopes = constants.scope,
      SCOPE_LAZY_SINGLETON = scopes.lazySingleton,
      SCOPE_EAGER_SINGLETON = scopes.eagerSingleton,
      SCOPE_MULTI_INSTANCE = scopes.multiInstance;

   function returnsDescriptor(name) {
      var descriptor = createDescriptor(name);

      descriptor.type = constants.type.returns;
      descriptor.scope = SCOPE_LAZY_SINGLETON;
      descriptor.returns = undefined;

      return descriptor;
   }

   function partDescriptor(name) {
      var descriptor = creatorDescriptor(name);
      descriptor.scope = moduleSystemSettings.defaultScope;

      return descriptor;
   }


   function createPart(name) {
      var descriptor;

      return {
         settings: addSettings,
         dependencies: addDependencies,
         creator: addCreator,
         returns: addReturns,
         scope: addScope
      };

      function addCreator(creator) {

         if(typeof creator !== 'function') {
            throw new Error('You have to pass the creator as a reference to a function');
         }

         getOrInitCreatorDiscriptor().creator = creator;
         save();
      }

      function addReturns(returns) {

         if(returns === undefined) {

            throw new Error('You have to pass the returns as one of these object types: string|integer|float|boolean|object|function|Array');
         }

         descriptor = returnsDescriptor(name);
         descriptor.returns = returns;
         save();
      }

      function addScope(scope) {

         if(SCOPE_LAZY_SINGLETON !== scope && SCOPE_EAGER_SINGLETON !== scope && SCOPE_MULTI_INSTANCE !== scope) {
            throw new Error('You have to pass the scope as one of these: lazy-singleton|eager-singleton|multi-instance');
         }

         var descriptor = getOrInitCreatorDiscriptor();

         if (scope !== undefined) {
            descriptor.scope = scope;
         }

         return {
            settings: addSettings,
            dependencies: addDependencies,
            creator: addCreator,
            returns: addReturns
         };
      }

      function addSettings(settings) {

         if(settings !== undefined && typeof settings !== 'object') {
            throw new Error('You have to pass the settings as an object');
         }

         getOrInitCreatorDiscriptor().settings = settings;

         return {
            dependencies: addDependencies,
            creator: addCreator,
            scope: addScope
         };
      }

      function addDependencies(dependencies) {

         if(dependencies !== undefined && !isArray(dependencies) ) {
            throw new Error('You have to pass the dependencies as an Array');
         }

         getOrInitCreatorDiscriptor().dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator,
            scope: addScope
         };
      }

      function getOrInitCreatorDiscriptor() {
         if (descriptor === undefined) {
            descriptor = partDescriptor(name);
         }

         return descriptor;
      }

      function save() {
         partAccess.addPartDescriptor(descriptor);
      }
   }


   return createPart;
}

/*exported parts */
function parts(settings) {
   'use strict';

   var loadedSingletonParts = {},
      loadedParts = [],
      availablePartDescriptors = {};

   function addPartDescriptor(partDescriptor) {
      availablePartDescriptors[partDescriptor.name] = partDescriptor;
   }

   function initEagerSingletons() {
      var eagerSingletonPartNames = [];

      eachProperty(availablePartDescriptors, function (partName, partDescriptor) {
         if (partDescriptor.scope === constants.scope.eagerSingleton) {
            eagerSingletonPartNames.push(partDescriptor.name);
         }
      });

      getOrInitializeParts(eagerSingletonPartNames, true);
   }


   function getOrInitializeParts(partNames, suppressErrors) {
      var parts = [];

      each(partNames, function (index, partName) {
         try {
            var part = getOrInitializePart(partName);
            parts.push(part);
         } catch (e) {
            if (suppressErrors) {
               settings.logger(e);
            } else {
               throw e;
            }
         }
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
      var domSettings = getDOMSettings(document, settings.partSettingsSelector.replace(/%partName%/g, partDescriptor.name)),
         mergedSettings = {},
         dependencies,
         foundDependencies,
         args,
         createdPart;
      try {
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
      } catch (e) {
         switch (e.name) {
         case 'RangeError':
            throw e;
         default:
            throw new PartCreationException(partDescriptor, e);
         }
      }

   }



   function callPostConstructs() {
      eachProperty(loadedParts, function (i, part) {
         callPostConstruct(part);
      });
   }

   function callPostConstruct(part) {
      if (typeof part.postConstruct === 'function') {
         try {
            part.postConstruct();
         } catch (e) {
            settings.logger('Exception while calling postConstruct', e);
         }

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

   function PartCreationException(descriptor, cause) {
      if (Error.captureStackTrace) {
         Error.captureStackTrace(this);
      }
      this.name = 'PartCreationException';
      this.cause = cause;
      this.descriptor = descriptor;

   }
   PartCreationException.prototype = Error.prototype;


   return {
      initEagerSingletons: initEagerSingletons,
      provisionPart: provisionPart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };
}
/*exported eventBus */
function eventBus() {
   'use strict';

   var ON_EVENT_FUNCTION_NAME = 'onEvent',
      components = [];

   function publishEvent(event) {

      if (event === undefined) {
         throw new Error('Published event cannot be undefined');
      }

      var callbackFunctionName = 'on' + event.name;

      each(components, function (index, component) {

         if (event.name !== undefined) {
            tryToCallComponent(component, callbackFunctionName, event);
         }

         tryToCallComponent(component, ON_EVENT_FUNCTION_NAME, event);
      });
   }

   function tryToCallComponent(component, functionName, event) {

      var callback = component[functionName];

      if (typeof callback === 'function') {
         callback.call(component, event);
      }
   }

   function addComponent(component) {
      if (component === undefined) {
         throw new Error('Component to be registered is undefined');
      }

      if (contains(components, component)) {
         throw new Error('Component is already registered');
      }

      components.push(component);
   }

   function reset() {
      components = [];
   }

   return {
      publish: publishEvent,
      add: addComponent,
      reset: reset
   };
}

moduleSystem = (function (settingsCreator, moduleBuilderCreator, partBuilderCreator, moduleLoaderCreator, partsCreator, modulesCreator, eventBusCreator) {
   'use strict';

   function newInstance() {
      var settings = settingsCreator(),
         actualSettings = settings.get(),
         partAccess = partsCreator(actualSettings),
         eventBus = eventBusCreator(),
         moduleAccess = modulesCreator(partAccess, eventBus, actualSettings),
         createPart = partBuilderCreator(partAccess, actualSettings),
         createModule = moduleBuilderCreator(moduleAccess),
         moduleLoader = moduleLoaderCreator(moduleAccess, partAccess, actualSettings);


      createPart('event-bus')
         .returns(eventBus);

      //deprecated remove in 1.4
      createPart('eventBus')
         .creator(function () {
            console.warn('partName "eventBus" deprecated use "event-bus" instead');
            return eventBus;
         });


      function initModulePageInterceptor(newSettings) {
         if (newSettings !== undefined) {
            settings.mergeWith(newSettings);
         }

         moduleLoader.initModulePage();
      }

      return merge({
         createPart: createPart,
         createModule: createModule,
         initModulePage: initModulePageInterceptor,
         newInstance: newInstance,
         getPart: partAccess.provisionPart,

      }, constants);
   }

   return newInstance();

})(settings, moduleBuilder, partBuilder, moduleLoader, parts, modules, eventBus);
/* jshint ignore:start */ 
}(window, document));
/* jshint ignore:end */
