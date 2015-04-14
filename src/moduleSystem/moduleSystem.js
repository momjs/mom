moduleSystem = (function () {
   'use strict';

   function newInstance() {
      var settings = settingsCreator(),
         parts = partsCreator(settings),
         eventBus = eventBusCreator(),
         modules = modulesCreator(parts, eventBus, settings),
         partBuilder = partBuilderCreator(parts, settings),
         modleBuilder = moduleBuilderCreator(modules),
         moduleLoader = moduleLoaderCreator(modules, parts, settings);


      partBuilder('event-bus')
         .returns(eventBus);

      //deprecated remove in 1.4
      partBuilder('eventBus')
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
         createPart: partBuilder,
         createModule: modleBuilder,
         initModulePage: initModulePageInterceptor,
         newInstance: newInstance,
         getPart: parts.provisionPart,

      }, constants);
   }

   return newInstance();

})();