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