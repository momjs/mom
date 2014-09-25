/* global moduleSystem:true */
/* jshint unused:false */
var moduleSystem = (function(moduleBuilderCreator, moduleLoaderCreator, eventBus) {
    'use strict';
    var moduleBuilder = moduleBuilderCreator(),
        moduleLoader = moduleLoaderCreator(moduleBuilder.parts, moduleBuilder.modules, eventBus);


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
