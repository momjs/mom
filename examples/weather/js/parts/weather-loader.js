(function() {

   mom.createPart('weather-loader')
      .dependencies(['event-bus', 'wwo-loader'])
      .scope(mom.scope.eagerSingleton)
      .creator(weatherLoader);

   function weatherLoader(eventBus, loader) {
      
      eventBus.add({
         onLocationChanged: onLocationChanged
      });

      /////////////////////////////////////////////
      
      function loadWeather(lat, lng) {
         loader.load(lat, lng, function (weather) {
            eventBus.publish(
               weatherChangedEvent(weather)
            );
         });
      }

      function onLocationChanged(event) {
         loadWeather(event.lat, event.lng);
      }
   }
})();
