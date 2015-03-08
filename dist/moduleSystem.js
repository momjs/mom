/**
 * moduleSystem
 * Dynamic Loading of Javascript based on DOM elements
 * @version v1.2.0 - 2015-03-08 * @link 
 * @author Eder Alexander <eder.alexan@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 *//* jshint ignore:start */
;
(function (window, document, undefined) {   
/* jshint ignore:end */

/* jshint unused:false */

/**
 * Iterates the array and callback function for each element.
 *
 * @param {Array} array the array to iterate
 * @param {function} callback the callback function:
 *      - first parameter delivers the current index, second the current element
 *      - if the callback function returns true the iteration breaks up immediately
 */
function each(array, callback) {
    'use strict';

    var index,
        length = array.length,
        element,
        breakLoop;

    for(index = 0; index < length; index++) {
        element = array[index];

        breakLoop = callback(index, element);

        if(breakLoop) {
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
function contains(array, elementToSearch) {
    'use strict';

    var index,
        length = array.length,
        element,
        isContaining = false;

    for(index = 0; index < length; index++) {
        element = array[index];

        if(element === elementToSearch) {
            isContaining = true;
            break;
        }
    }

    return isContaining;
}

/* jshint unused:false */

/**
 * Iterates over all own properties of the specified object.
 * @param object
 * @param callback the callback function which will be called for each property key and value
 */
function eachProperty(object, callback) {
    'use strict';

    var propertyKey,
        propertyValue,
        breakup;

    for(propertyKey in object) {
        if(object.hasOwnProperty(propertyKey)) {

            propertyValue = object[propertyKey];
            breakup = callback(propertyKey, propertyValue);

            if(breakup) {
                break;
            }
        }
    }
}

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

/* jshint unused:false */
var constants = {
   scope: {
      singleton: 'singleton',
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
         defaultScope: constants.scope.multiInstance,
         settingsSelector: 'script[type="%moduleName%/settings"]',
         attribute: 'modules',
         selector: '[%attribute%]'
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
            modulesOnPage = document.querySelectorAll(selector);

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
         descriptor.creator = creator;
         save();
      }

      function addSettings(settings) {
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
      if (availableModuleDescriptors.hasOwnProperty(moduleName)) {
         moduleDescriptor = availableModuleDescriptors[moduleName];

         foundDependencies = partAccess.getParts(moduleDescriptor.dependencies);
         // check if all needed dependencies are found
         if (foundDependencies.length === moduleDescriptor.dependencies.length) {
            buildModule(element, moduleDescriptor, foundDependencies);
         } else {
            throw new Error('Required Parts Missing from ' + moduleName + ' dependencies: ' + JSON.stringify(moduleDescriptor.dependencies));
         }
      } else {
         throw new Error('Module ' + moduleName + ' not registered but found in dom');
      }
   }

   function buildModule(element, moduleDescriptor, foundDependencies) {
      //build arguments
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
         settings = JSON.parse(settingsAsHtml);
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
/*exported partBuilder */
function partBuilder(partAccess, moduleSystemSettings) {
   'use strict';

   function returnsDescriptor(name) {
      var descriptor = createDescriptor(name);
      descriptor.type = constants.type.returns;

      descriptor.scope = constants.scope.singleton;

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
         getOrInitCreatorDiscriptor().creator = creator;
         save();
      }

      function addReturns(returns) {
         descriptor = returnsDescriptor(name);
         descriptor.returns = returns;
         save();
      }

      function addScope(scope) {

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
         getOrInitCreatorDiscriptor().settings = settings;

         return {
            dependencies: addDependencies,
            creator: addCreator
         };
      }

      function addDependencies(dependencies) {
         getOrInitCreatorDiscriptor().dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator
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
function parts() {
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
      case constants.scope.multiInstance:
         return multiInstanceConstructionStrategy;
      case constants.scope.singleton:
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
      var dependencies,
         foundDependencies,
         args,
         createdPart;

      dependencies = partDescriptor.dependencies;
      foundDependencies = getOrInitializeParts(dependencies);

      //initialize Parts here
      args = foundDependencies;
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
      eachProperty(loadedParts, function (i, part) {
         callPostConstruct(part);
      });
   }

   function callPostConstruct(part) {
      if (typeof part.postConstruct === 'function') {
         part.postConstruct();

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


   return {
      provisionPart: provisionPart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };
}
/* jshint unused:false */

function eventBus() {
    'use strict';

    var ON_EVENT_FUNCTION_NAME = 'onEvent',
        components = [];

    function publishEvent(event) {

        if (event === undefined) {
            throw new Error('Published event cannot be undefined');
        }

        var callbackFunctionName = 'on' + event.name;

        each(components, function(index, component) {

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
         partAccess = partsCreator(),
         eventBus = eventBusCreator(),
         moduleAccess = modulesCreator(partAccess, eventBus, actualSettings),
         createPart = partBuilderCreator(partAccess, actualSettings),
         createModule = moduleBuilderCreator(moduleAccess),
         moduleLoader = moduleLoaderCreator(moduleAccess, partAccess, actualSettings);


      createPart('eventBus')
         .scope(constants.scope.singleton)
         .creator(function () {
            return eventBus;
         });

      function settingsInterceptor(intercepted) {
         return function (newSettings) {
            if (newSettings !== undefined) {
               settings.mergeWith(newSettings);
            }

            intercepted();
         };
      }

      return merge({
         createPart: createPart,
         createModule: createModule,
         initModulePage: settingsInterceptor(moduleLoader.initModulePage),
         newInstance: newInstance,
         getPart: partAccess.provisionPart,

      }, constants);
   }

   return newInstance();

})(settings, moduleBuilder, partBuilder, moduleLoader, parts, modules, eventBus);
/* jshint ignore:start */ 
}(window, document));
/* jshint ignore:end */