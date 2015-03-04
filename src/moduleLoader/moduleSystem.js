/* global moduleSystem:true */
moduleSystem = (function (settingsCreator, moduleBuilderCreator, partBuilderCreator, moduleLoaderCreator, partAccessCreator, moduleAccessCreator, eventBusCreator) {
   'use strict';

   function newInstance() {
      var settings = settingsCreator(),
          actualSettings = settings.get(),
         partAccess = partAccessCreator(),
         eventBus = eventBusCreator(),
         moduleAccess = moduleAccessCreator(partAccess, eventBus, actualSettings),
         createPart = partBuilderCreator(partAccess, actualSettings),
         createModule = moduleBuilderCreator(moduleAccess),
         moduleLoader = moduleLoaderCreator(moduleAccess, partAccess, actualSettings);


      createPart('eventBus').creator(function () {
         return eventBus;
      });
      
      function settingsInterceptor(intercepted) {
         return function(newSettings) {
            if(newSettings !== undefined) {
               settings.mergeWith(newSettings);
            }
            
            intercepted();
         };
      }

      return {
         createPart: createPart,
         createModule: createModule,
         initModulePage: settingsInterceptor(moduleLoader.initModulePage),
         newInstance: newInstance,
         getPart: partAccess.provisionPart
      };
   }

   return newInstance();

})(settings, moduleBuilder, partBuilder, moduleLoader, partAccess, moduleAccess, eventBus);
