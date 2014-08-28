/* global moduleSystem:true */
/* jshint unused:false */
var moduleSystem = (function(moduleBuilderCreator, moduleLoaderCreator) {
    'use strict';
    var moduleBuilder = moduleBuilderCreator(),
        moduleLoader = moduleLoaderCreator(moduleBuilder);

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

})(moduleBuilder, moduleLoader);
