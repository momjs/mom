var moduleSystem = {};
moduleSystem.createModule = function(name) {
    if (typeof name !== "string") {
        throw new Error("Name missing");
    }
    var dependencies = [];
    var settings;


    function addModule(module) {
        moduleSystem.modules = moduleSystem.modules || {};
        var moduleObj = {
            creator: module,
            name: name,
            dependencies: dependencies,
            settings: settings
        };

        moduleSystem.modules[name] = moduleObj;
    }

    function addSettings(neededSettings) {
        settings = neededSettings;

        return {
            dependencies: addDependencies,
            creator: addModule
        };
    }


    function addDependencies(neededParts) {
        if (!$.isArray(neededParts)) {
            neededParts = [neededParts];
        }

        dependencies = neededParts;

        return {
            settings: addSettings,
            creator: addModule
        };
    }

    return {
        settings: addSettings,
        dependencies: addDependencies,
        creator: addModule
    };
};

moduleSystem.createPart = function(name) {
    if (typeof name !== "string") {
        throw new Error("Name missing");
    }
    var dependencies = [];
    var settings;

    function addPart(creator) {
        moduleSystem.parts = moduleSystem.parts || {};
        var partObj = {
            creator: creator,
            name: name,
            dependencies: dependencies,
            settings: settings
        };

        moduleSystem.parts[name] = partObj;
    }

    function addSettings(neededSettings) {
        settings = neededSettings;

        return {
            settings: addSettings,
            dependencies: addDependencies,
            creator: addPart
        };
    }


    function addDependencies(neededParts) {
        if (!$.isArray(neededParts)) {
            neededParts = [neededParts];
        }

        dependencies = neededParts;

        return {
            creator: addPart
        };
    }


    return {
        settings: addSettings,
        dependencies: addDependencies,
        creator: addPart
    };
};


moduleSystem.initModulePage = function() {
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

        moduleSystem.parts = moduleSystem.parts || {};

        //gather parts
        for (name in moduleSystem.parts) {
            partDescriptor = moduleSystem.parts[name];

            partsToBeLoaded.push(partDescriptor);
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
                        if (typeof partDescriptor.settings !== "undefined") {
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
                throw new Error("provision error can't resolve dependencies for parts:" + JSON.stringify(partsToBeLoaded));
            }
        }
    }


    function initModules() {
        var $modulesOnPage = $("[data-module]"),
            name,
            module;

        moduleSystem.modules = moduleSystem.modules || {};


        $modulesOnPage.each(function(index, element) {
            var $element = $(element),
                moduleNames = $element.data("module").split(","),
                moduleName, moduleDescriptor,
                createdModule,
                name,
                i,
                foundDependencies,
                args,
                domSettings,
                mergedSettings;


            for (i = 0; i < moduleNames.length; i++) {
                moduleName = moduleNames[i];
                if (moduleSystem.modules.hasOwnProperty(moduleName)) {
                    moduleDescriptor = moduleSystem.modules[moduleName];

                    foundDependencies = getDependencies(moduleDescriptor.dependencies);
                    if (foundDependencies.length == moduleDescriptor.dependencies.length) {
                        args = foundDependencies;
                        domSettings = getDOMSettings($element, moduleName);
                        if (typeof moduleDescriptor.settings !== "undefined" || typeof domSettings !== "undefined") {
                            mergedSettings = $.extend({}, moduleDescriptor.settings, domSettings);

                            args.unshift(mergedSettings);
                        }
                        args.unshift($element);

                        createdModule = moduleDescriptor.creator.apply(null, args);

                        if (typeof createdModule === "undefined") {
                            createdModule = {};
                        }

                        name = getIncrementedModuleName(moduleDescriptor.name);

                        createdModule.name = name;
                        loadedModules[name] = createdModule;
                        eventBus.add(createdModule);
                    } else {
                        throw new Error("Required Parts Missing from " + moduleName + " dependencies: " + JSON.stringify(moduleDescriptor.dependencies));
                    }
                } else {
                    throw new Error("Module " + moduleName + " not registered but found in dom");
                }

            }
        });


        for (name in loadedModules) {
            module = loadedModules[name];
            if (typeof module.postConstruct === "function") {
                module.postConstruct();
            }
        }


        function getDOMSettings($element, moduleName) {
            return $element.data(moduleName.toLowerCase() + "Settings");
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

};