moduleSystem = (function (settingsCreator, moduleBuilderCreator, partBuilderCreator, moduleLoaderCreator, partsCreator, modulesCreator, eventBusCreator) {
   'use strict';

   function newInstance() {
      var settings = settingsCreator(),
         actualSettings = settings.get(),
         partAccess = partsCreator(),
         eventBus = eventBusCreator(),
         moduleAccess = modulesCreator(partAccess, eventBus, actualSettings),
         createPart = partBuilderCreator(partAccess, actualSettings),
         createModule = moduleBuilderCreator(moduleAccess),
         moduleLoader = moduleLoaderCreator(moduleAccess, partAccess, actualSettings);


      createPart('eventBus')
         .scope(constants.scope.lazySingleton)
         .creator(function () {
            return eventBus;
         });

      function settingsInterceptor(intercepted) {
         return function (newSettings) {
            if (newSettings !== undefined) {
               settings.mergeWith(newSettings);
            }

            intercepted();
         };
      }

      return merge({
         createPart: createPart,
         createModule: createModule,
         initModulePage: settingsInterceptor(moduleLoader.initModulePage),
         newInstance: newInstance,
         getPart: partAccess.provisionPart,

      }, constants);
   }

   return newInstance();

})(settings, moduleBuilder, partBuilder, moduleLoader, parts, modules, eventBus);