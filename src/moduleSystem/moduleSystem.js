moduleSystem = (function (settingsCreator, moduleBuilderCreator, partBuilderCreator, moduleLoaderCreator, partsCreator, modulesCreator, eventBusCreator) {
   'use strict';

   function newInstance() {
      var settings = settingsCreator(),
         actualSettings = settings.get(),
         partAccess = partsCreator(actualSettings),
         eventBus = eventBusCreator(),
         moduleAccess = modulesCreator(partAccess, eventBus, actualSettings),
         createPart = partBuilderCreator(partAccess, actualSettings),
         createModule = moduleBuilderCreator(moduleAccess),
         moduleLoader = moduleLoaderCreator(moduleAccess, partAccess, actualSettings);


      createPart('event-bus')
         .returns(eventBus);

      //deprecated remove in 1.4
      createPart('eventBus')
         .creator(function () {
            if (window.console && console.warn) {
               console.warn('partName "eventBus" deprecated use "event-bus" instead');
            }
            return eventBus;
         });


      function initModulePageInterceptor(newSettings) {
         if (newSettings !== undefined) {
            settings.mergeWith(newSettings);
         }

         moduleLoader.initModulePage();
      }

      return merge({
         createPart: createPart,
         createModule: createModule,
         initModulePage: initModulePageInterceptor,
         newInstance: newInstance,
         getPart: partAccess.provisionPart,

      }, constants);
   }

   return newInstance();

})(settings, moduleBuilder, partBuilder, moduleLoader, parts, modules, eventBus);