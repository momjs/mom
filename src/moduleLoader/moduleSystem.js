/* global moduleSystem:true */
moduleSystem = (function (moduleBuilderCreator, moduleLoaderCreator, partAccessCreator, moduleAccessCreator, eventBusCreator) {
   'use strict';
   var partAccess = partAccessCreator(),
      eventBus = eventBusCreator(),
      moduleAccess = moduleAccessCreator(partAccess, eventBus),
      moduleBuilder = moduleBuilderCreator(moduleAccess, partAccess),
      moduleLoader = moduleLoaderCreator(moduleAccess, partAccess);


   moduleBuilder.createPart('eventBus').creator(function () {
      return eventBus;
   });


   function reset() {
      partAccess.reset();
      moduleAccess.reset();
      eventBus.reset();

      moduleBuilder.createPart('eventBus').creator(function () {
         return eventBus;
      });
   }

   return {
      createPart: moduleBuilder.createPart,
      createModule: moduleBuilder.createModule,
      initModulePage: moduleLoader.initModulePage,
      reset: reset,
      getPart: partAccess.provisionPart
   };

})(moduleBuilder, moduleLoader, partAccess, moduleAccess, eventBus);