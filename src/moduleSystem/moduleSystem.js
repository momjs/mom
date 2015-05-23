mom = (function () {
   'use strict';

   function newInstance() {
      var settings = settingsCreator(),
         parts = partsCreator(settings),
         eventBus = eventBusCreator(),
         loadedModules = loadedModulesContainerCreator(settings),
         modules = modulesCreator(parts, eventBus, loadedModules, settings),
         partBuilder = partBuilderCreator(parts, settings),
         moduleBuilder = moduleBuilderCreator(modules),
         domEventListener = domEventListenerCreator(settings, modules, parts),
         moduleLoader = moduleLoaderCreator(modules, parts, domEventListener, settings);

      partBuilder('event-bus')
         .returns(eventBus);

      function initModulePageInterceptor(newSettings) {
         if (newSettings !== undefined) {
            settings.mergeWith(newSettings);
         }

         moduleLoader.initModulePage();
      }

      function dispose() {
         if (domEventListener !== undefined) {
            domEventListener.unregisterToEvents();
         }

         eventBus.reset();
      }

      return merge({
         createPart: partBuilder,
         createModule: moduleBuilder,
         initModulePage: initModulePageInterceptor,
         newInstance: newInstance,
         dispose: dispose,
         getPart: parts.provisionPart

      }, constants);
   }

   return newInstance();

})();
