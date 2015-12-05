mom = (function () {
   'use strict';

   return newInstance();

   ///////////////////////////////////////////////////////////////////////////////////////////

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

      return merge({
        createPart: partBuilder,
        createModule: moduleBuilder,
        provisionDomElement: modules.provisionModule,
        initModulePage: initModulePageInterceptor,
        newInstance: newInstance,
        dispose: dispose,
        getPart: parts.provisionPart,
        getPartDescriptor: parts.getPartDescriptor,
        getModuleDescriptor: modules.getModuleDescriptor
      }, constants);

      ////////////////////////////////////////////////////////////////////////////////////////

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
   }
})();
