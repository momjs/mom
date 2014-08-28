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