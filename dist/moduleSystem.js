/**
 * moduleSystem
 * Dynamic Loading of Javascript based on DOM elements
 * @version v1.1.1 - 2014-12-09 * @link 
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

/* global moduleLoader:true */
/* jshint unused:false */
var moduleLoader = function (moduleAccess, partAccess) {
   'use strict';

   function initModulePage() {

      initModules();

      function initModules() {
         var modulesOnPage = document.querySelectorAll('[modules]');

         each(modulesOnPage, function(index, element) {
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
};

/* global moduleBuilder:true */
/* jshint unused:false */
var moduleBuilder = function (moduleAccess, partAccess) {
   'use strict';

   function create(store) {
      return function (name) {
         if (typeof name !== 'string') {
            throw new Error('Name missing');
         }
         var dependencies = [];
         var settings;


         function add(creator) {
            var descriptor = {
               creator: creator,
               name: name,
               dependencies: dependencies,
               settings: settings
            };
            store(descriptor);
         }

         function addSettings(neededSettings) {
            settings = neededSettings;

            return {
               dependencies: addDependencies,
               creator: add
            };
         }


         function addDependencies(neededParts) {

            dependencies = neededParts;

            return {
               settings: addSettings,
               creator: add
            };
         }

         return {
            settings: addSettings,
            dependencies: addDependencies,
            creator: add
         };
      };
   }

   return {
      createPart: create(partAccess.addPartDescriptor),
      createModule: create(moduleAccess.addModuleDescriptor)
   };
};

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
      var parts = [];

      each(partNames, function (index, partName) {
         parts.push(getOrInitializePart(partName));
      });

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
      createdPart = partDescriptor.creator.apply(partDescriptor, args);

      if (createdPart === undefined) {
         createdPart = {};
      }

      loadedParts[partDescriptor.name] = createdPart;

      return createdPart;
   }

   function callPostConstructs() {
      callPostConstruct(loadedParts);

      function callPostConstruct(store) {

         eachProperty(store, function (elementName, element) {

            if (typeof element.postConstruct === 'function') {

               element.postConstruct();
            }
         });
      }
   }


   return {
      provisionPart: getOrInitializePart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };
};
/* global moduleAccess:true */
/* jshint unused:false */
var moduleAccess = function (partAccess, eventBus) {
   'use strict';

   var loadedModules = [],
      availableModuleDescriptors = {};

   function addModuleDescriptor(moduleDescriptor) {
      availableModuleDescriptors[moduleDescriptor.name] = moduleDescriptor;
   }

   function initializeModules(element) {
      var moduleNames = element.getAttribute('modules'),
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
         createdModule,
         name;

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

      var settingsScript = element.querySelector('script[type="' + moduleName + '/settings"]'),
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

   function merge() {
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


   return {
      provisionModule: initializeModules,
      provisionFinished: callPostConstructs,
      addModuleDescriptor: addModuleDescriptor
   };
};
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

/* global moduleSystem:true */
moduleSystem = (function (moduleBuilderCreator, moduleLoaderCreator, partAccessCreator, moduleAccessCreator, eventBusCreator) {
   'use strict';

   function newInstance() {
      var partAccess = partAccessCreator(),
         eventBus = eventBusCreator(),
         moduleAccess = moduleAccessCreator(partAccess, eventBus),
         moduleBuilder = moduleBuilderCreator(moduleAccess, partAccess),
         moduleLoader = moduleLoaderCreator(moduleAccess, partAccess);


      moduleBuilder.createPart('eventBus').creator(function () {
         return eventBus;
      });

      return {
         createPart: moduleBuilder.createPart,
         createModule: moduleBuilder.createModule,
         initModulePage: moduleLoader.initModulePage,
         newInstance: newInstance,
         getPart: partAccess.provisionPart
      };
   }

   return newInstance();

})(moduleBuilder, moduleLoader, partAccess, moduleAccess, eventBus);

/* jshint ignore:start */ 
}(window, document));
/* jshint ignore:end */