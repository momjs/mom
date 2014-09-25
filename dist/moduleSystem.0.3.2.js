/**
 * moduleSystem
 * Dynamic Loading of Javascript based on DOM elements
 * @version v0.3.2 - 2014-09-25 * @link 
 * @author Eder Alexander <eder.alexan@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 *//* global moduleLoader:true */
/* jshint unused:false */
var moduleLoader = function(moduleBuilder) {
    'use strict';

    var modules = moduleBuilder.modules,
        parts = moduleBuilder.parts;


    function initModulePage() {
        var loadedParts = {};
        var loadedModules = {};

        initParts();
        initModules();

        function initParts() {
            var name,
                partDescriptor,
                i,
                dependencies,
                foundDependencies,
                createdPart,
                partsToBeLoaded = [],
                oldPartsToBeLoaded,
                args;


            //gather parts
            for (name in parts) {
                if(parts.hasOwnProperty(name)) {
                    partDescriptor = parts[name];

                    partsToBeLoaded.push(partDescriptor);
                }
            }

            if (partsToBeLoaded.length > 0) {
                do {
                    oldPartsToBeLoaded = partsToBeLoaded;
                    partsToBeLoaded = [];

                    //load parts
                    for (i = 0; i < oldPartsToBeLoaded.length; i++) {
                        partDescriptor = oldPartsToBeLoaded[i];
                        dependencies = partDescriptor.dependencies;
                        foundDependencies = getDependencies(dependencies);
                        if (foundDependencies.length === dependencies.length) {
                            args = foundDependencies;
                            if (partDescriptor.settings !== undefined) {
                                args.unshift(partDescriptor.settings);
                            }

                            createdPart = partDescriptor.creator.apply(null, args);
                            loadedParts[partDescriptor.name] = createdPart;
                        } else {
                            partsToBeLoaded.push(partDescriptor);
                        }
                    }
                } while (oldPartsToBeLoaded.length > partsToBeLoaded.length);


                //error handling
                if (partsToBeLoaded.length > 0) {
                    throw new Error('provision error can\'t resolve dependencies for parts:' + JSON.stringify(partsToBeLoaded));
                }
            }
        }


        function initModules() {
            var $modulesOnPage = $('[data-module]'),
                name,
                module;

            $modulesOnPage.each(function(index, element) {
                var $element = $(element),
                    moduleNames = $element.data('module').split(','),
                    moduleName,
                    moduleDescriptor,
                    createdModule,
                    name,
                    i,
                    foundDependencies,
                    args,
                    domSettings,
                    mergedSettings;


                for (i = 0; i < moduleNames.length; i++) {
                    moduleName = moduleNames[i];
                    if (modules.hasOwnProperty(moduleName)) {
                        moduleDescriptor = modules[moduleName];

                        foundDependencies = getDependencies(moduleDescriptor.dependencies);
                        if (foundDependencies.length === moduleDescriptor.dependencies.length) {
                            args = foundDependencies;
                            domSettings = getDOMSettings($element, moduleName);
                            if (moduleDescriptor.settings !== undefined || domSettings !== undefined) {
                                mergedSettings = $.extend({}, moduleDescriptor.settings, domSettings);

                                args.unshift(mergedSettings);
                            }
                            args.unshift($element);

                            createdModule = moduleDescriptor.creator.apply(null, args);

                            if (createdModule === undefined) {
                                createdModule = {};
                            }

                            name = getIncrementedModuleName(moduleDescriptor.name);

                            createdModule.name = name;
                            loadedModules[name] = createdModule;


                            eventBus.add(createdModule);
                        } else {
                            throw new Error('Required Parts Missing from ' + moduleName + ' dependencies: ' + JSON.stringify(moduleDescriptor.dependencies));
                        }
                    } else {
                        throw new Error('Module ' + moduleName + ' not registered but found in dom');
                    }

                }
            });


            for (name in loadedModules) {
                if(loadedModules.hasOwnProperty(name)) {
                    module = loadedModules[name];
                    if (typeof module.postConstruct === 'function') {
                        module.postConstruct();
                    }
                }

            }


            function getDOMSettings($element, moduleName) {

                var $settingsScript = $element.find('script[type="' + moduleName + '/settings"]'),
                    settingsAsHtml = $settingsScript.html();

                if(settingsAsHtml !== undefined) {
                    return $.parseJSON(settingsAsHtml);
                }
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

        /**
         * returns all dependencies, which are currently loaded.
         * This doesn't garante to load all needed dependencies
         **/
        function getDependencies(dependencies) {
            var parts = [];

            if (dependencies.length > 0) {
                $.each(dependencies, function() {
                    if (loadedParts.hasOwnProperty(this)) {
                        var part = loadedParts[this];
                        parts.push(part);
                    }
                });
            }
            return parts;
        }
    }

    function reset() {
        removeProperties(parts);
        removeProperties(modules);

        function removeProperties(store) {
            for (var member in store) {
                if(store.hasOwnProperty(member)) {
                    delete store[member];
                }
            }
        }
    }


    return {
        initModulePage: initModulePage,
        reset: reset
    };
};
/* global moduleBuilder:true */
/* jshint unused:false */
var moduleBuilder = function() {
    'use strict';

    var modules = {},
        parts = {};

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
                if (store.hasOwnProperty(name)) {
                    throw new Error(name + ' already registered');
                }
                store[name] = descriptor;
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

    function reset() {
        removeProperties(parts);
        removeProperties(modules);

        function removeProperties(store) {
            for (var member in store) {
                if(store.hasOwnProperty(member)) {
                    delete store[member];
                }
            }
        }
    }

    return {
        createPart: create(parts),
        createModule: create(modules),
        modules: modules,
        parts: parts,
        reset: reset
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
var moduleSystem = (function(moduleBuilderCreator, moduleLoaderCreator, eventBus) {
    'use strict';
    var moduleBuilder = moduleBuilderCreator(),
        moduleLoader = moduleLoaderCreator(moduleBuilder, eventBus);


    moduleBuilder.createPart('eventBus').creator(function() {
        return eventBus;
    });


    function reset() {
        moduleBuilder.reset();
        moduleLoader.reset();
    }

    return {
        createPart: moduleBuilder.createPart,
        createModule: moduleBuilder.createModule,
        initModulePage: moduleLoader.initModulePage,
        reset: reset
    };

})(moduleBuilder, moduleLoader, eventBus);
