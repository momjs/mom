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
         moduleLoader = moduleLoaderCreator(modules, parts, settings),
         domEventListener = domEventListenerCreator(settings, modules, parts);

      partBuilder('event-bus')
         .returns(eventBus);

      function initModulePageInterceptor(newSettings) {
         if (newSettings !== undefined) {
            settings.mergeWith(newSettings);
         }

         if (settings.domMutationSupport === true) {
            domEventListener.registerToEvents();
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