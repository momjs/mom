/* global moduleLoader:true */
/* jshint unused:false */
var moduleLoader = function(parts, modules, eventBus) {
    'use strict';


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

                        // check if all needed dependencies are found
                        if (foundDependencies.length === dependencies.length) {
                            //build arguments for part
                            args = foundDependencies;

                                // add settings from descriptor
                            if (partDescriptor.settings !== undefined) {
                                args.unshift(partDescriptor.settings);
                            }

                            // create part
                            createdPart = partDescriptor.creator.apply(null, args);
                            loadedParts[partDescriptor.name] = createdPart;
                        } else {

                            // try on next iteration
                            partsToBeLoaded.push(partDescriptor);
                        }
                    }
                    //provisioning isn't finished until at least one new part could be initialized
                } while (oldPartsToBeLoaded.length > partsToBeLoaded.length);


                //error handling
                //true if not all parts could be provisioned
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
                    moduleNames = $element.data('module').split(',');

                $.each(moduleNames, function(i, moduleName) {
                    var moduleDescriptor,
                        createdModule,
                        name,
                        foundDependencies,
                        args,
                        domSettings,
                        mergedSettings;

                    //check if module to be loaded is registered
                    if (modules.hasOwnProperty(moduleName)) {
                        moduleDescriptor = modules[moduleName];

                        foundDependencies = getDependencies(moduleDescriptor.dependencies);
                        // check if all needed dependencies are found
                        if (foundDependencies.length === moduleDescriptor.dependencies.length) {
                            //build arguments
                            args = foundDependencies;

                                //gather settings
                            domSettings = getDOMSettings($element, moduleName);
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
                        } else {
                            throw new Error('Required Parts Missing from ' + moduleName + ' dependencies: ' + JSON.stringify(moduleDescriptor.dependencies));
                        }
                    } else {
                        throw new Error('Module ' + moduleName + ' not registered but found in dom');
                    }
                });
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