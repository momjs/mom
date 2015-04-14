moduleSystem = (function () {
   'use strict';

   function newInstance() {
      var _settings = settings(),
         _parts = parts(_settings),
         _eventBus = eventBus(),
         _modules = modules(_parts, _eventBus, _settings),
         _partBuilder = partBuilder(_parts, _settings),
         _moduleBuilder = moduleBuilder(_modules),
         _moduleLoader = moduleLoader(_modules, _parts, _settings);


      _partBuilder('event-bus')
         .returns(_eventBus);

      //deprecated remove in 1.4
      _partBuilder('eventBus')
         .creator(function () {
            if (window.console && console.warn) {
               console.warn('partName "eventBus" deprecated use "event-bus" instead');
            }

            return _eventBus;
         });


      function initModulePageInterceptor(newSettings) {
         if (newSettings !== undefined) {
            _settings.mergeWith(newSettings);
         }

         _moduleLoader.initModulePage();
      }

      return merge({
         createPart: _partBuilder,
         createModule: _moduleBuilder,
         initModulePage: initModulePageInterceptor,
         newInstance: newInstance,
         getPart: _parts.provisionPart,

      }, constants);
   }

   return newInstance();

})();