/**
 * moduleSystem
 * Dynamic Loading of Javascript based on DOM elements
 * @version v0.3.3 - 2014-10-04 * @link 
 * @author Eder Alexander <eder.alexan@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 *//* global moduleLoader:true */
/* jshint unused:false */
var moduleLoader = function (moduleAccess, partAccess) {
   'use strict';


   function initModulePage() {

      initModules();


      function initModules() {
         var $modulesOnPage = $('[data-module]');

         $modulesOnPage.each(function (index, element) {
            var $element = $(element);

            moduleAccess.provisionModule($(element));

         });

         partAccess.provisionFinished();
         moduleAccess.provisionFinished();

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
            if (!$.isArray(neededParts)) {
               neededParts = [neededParts];
            }

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

      $.each(partNames, function (i, partName) {
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
      createdPart = partDescriptor.creator.apply(null, args);

      if (createdPart === undefined) {
         createdPart = {};
      }

      loadedParts[partDescriptor.name] = createdPart;

      return createdPart;
   }


   function callPostConstructs() {
      callPostConstruct(loadedParts);

      function callPostConstruct(store) {
         $.each(store, function (i, element) {
            if (typeof element.postConstruct === 'function') {
               element.postConstruct();
            }
         });
      }
   }

   function reset() {
      loadedParts = {};
      availablePartDescriptors = {};
   }

   return {
      reset: reset,
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

   var loadedModules = {},
      availableModuleDescriptors = {};


   function addModuleDescriptor(moduleDescriptor) {
      availableModuleDescriptors[moduleDescriptor.name] = moduleDescriptor;
   }


   function initializeModule($element) {
      var moduleName = $element.data('module'),
         moduleDescriptor,
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
      args.unshift($element);

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
      provisionModule: initializeModule,
      provisionFinished: callPostConstructs,
      addModuleDescriptor: addModuleDescriptor
   };
};
/* global eventBus:true */
/* jshint unused:false */
var eventBus = (function() {
    'use strict';

    function Event(name) {
        this.name = name;
        this.getData = function() {
            var result = {};

            for (var property in this) {
                if (this.hasOwnProperty(property) && property !== 'name' && property !== 'getData') {
                    result[property] = this[property];
                }
            }

            return result;
        };
    }

    var components = {},
        eventPrototype = new Event(),
        Events = {

            register: function(Event, name) {
                if (typeof Event !== 'function') {
                    throw new Error('No Event provided');
                }

                if (name in Events) {
                    throw new Error('Error registering event, duplicate Event with name [' + name + ']');
                }

                Event.prototype = eventPrototype;

                Events[name] = Event;

                return Event;
            }
        };

    function publishEvent(event, source) {

        // if no event is provided, or event has no name, do not publish an event
        if (typeof event === 'undefined' || typeof event.name === 'undefined') {
            return;
        }

        var callbackFunctionName = 'on' + event.name,
            componentName,
            component,
            callback;

        //call components
        for (componentName in components) {
            if(components.hasOwnProperty(componentName)) {
                component = components[componentName];
                callback = component[callbackFunctionName];

                if (typeof callback === 'function') {
                    source = source || component;
                    callback.call(source, event.getData());
                }
            }
        }
    }

    function addComponent(component, replaceDuplicates) {
        if (typeof component === 'undefined') {
            throw new Error('Component to be registered is undefined');
        }
        if (typeof component.name === 'undefined') {
            throw new Error('Component name to be registered is undefined');
        }

        if (component.name in components) {
            if (replaceDuplicates) {
                removeComponent(component.name);
            } else {
                throw new Error('Component with name [' + component.name + '] already registered');
            }
        }

        components[component.name] = component;
    }

    function removeComponent(name) {
        if (name in components) {
            delete components[name];
        }
    }

    function reset() {
        components = {};
    }


    return {
        publish: publishEvent,
        add: addComponent,
        remove: removeComponent,
        reset: reset,
        Events: Events
    };

})();

/* global moduleSystem:true */
/* jshint unused:false */
var moduleSystem = (function (moduleBuilderCreator, moduleLoaderCreator, partAccessCreator, moduleAccessCreator, eventBus) {
   'use strict';
   var partAccess = partAccessCreator(),
      moduleAccess = moduleAccessCreator(partAccess, eventBus),
      moduleBuilder = moduleBuilderCreator(moduleAccess, partAccess),
      moduleLoader = moduleLoaderCreator(moduleAccess, partAccess);


   moduleBuilder.createPart('eventBus').creator(function () {
      return eventBus;
   });


   function reset() {
      partAccess.reset();
      moduleAccess.reset();

      moduleBuilder.createPart('eventBus').creator(function () {
         return eventBus;
      });
   }

   return {
      createPart: moduleBuilder.createPart,
      createModule: moduleBuilder.createModule,
      initModulePage: moduleLoader.initModulePage,
      reset: reset
   };

})(moduleBuilder, moduleLoader, partAccess, moduleAccess, eventBus);