moduleSystem = (function (settingsCreator, moduleBuilderCreator, partBuilderCreator, moduleLoaderCreator, partsCreator, modulesCreator, eventBusCreator, domEventListenerCreator) {
   'use strict';

   function newInstance() {
      var settings = settingsCreator(),
         actualSettings = settings.get(),
         partAccess = partsCreator(actualSettings),
         eventBus = eventBusCreator(),
         moduleAccess = modulesCreator(partAccess, eventBus, actualSettings),
         createPart = partBuilderCreator(partAccess, actualSettings),
         createModule = moduleBuilderCreator(moduleAccess),
         moduleLoader = moduleLoaderCreator(moduleAccess, partAccess, actualSettings),
         domEventListener;


      createPart('event-bus')
         .returns(eventBus);

      //deprecated remove in 1.4
      createPart('eventBus')
         .creator(function () {
            console.warn('partName "eventBus" deprecated use "event-bus" instead');
            return eventBus;
         });

      function initModulePageInterceptor(newSettings) {
         if (newSettings !== undefined) {
            settings.mergeWith(newSettings);
         }

         moduleLoader.initModulePage();

         domEventListener = domEventListenerCreator(actualSettings, moduleAccess);
         domEventListener.registerToEvents();
      }

      function dispose() {
         if(domEventListener !== undefined) {
            domEventListener.unregisterToEvents();
         }

         eventBus.reset();
      }

      return merge({
         createPart: createPart,
         createModule: createModule,
         initModulePage: initModulePageInterceptor,
         newInstance: newInstance,
         dispose: dispose,
         getPart: partAccess.provisionPart

      }, constants);
   }

   return newInstance();

})(settings, moduleBuilder, partBuilder, moduleLoader, parts, modules, eventBus, domEventListener);