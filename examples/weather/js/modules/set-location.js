(function() {
   
   mom.createModule('set-location')
      .dependencies(['location-translator', 'event-bus'])
      .settings({
         city: 'New York'
      })
      .creator(setLocationCreator);
   
   
   function setLocationCreator(domElement, settings, translator, eventBus) {
      var $location = $(domElement);

      setLocation(settings.city);

      $location.on('change', function () {
         var location = $location.val();

         if (location !== '') {
            publishLocation(location);
         }
      });
      
      return {
         onLocationChanged: onLocationChanged,
         postConstruct: postConstruct
      };
      
      //////////////////////////////////////////////////

      function setLocation(name) {
         $location.val(name);
      }

      function publishLocation(location) {
         translator.toCoordinates(location, function (lat, lng) {
            eventBus.publish(locationChangedEvent(lat, lng));
         });
      }

      function onLocationChanged(event) {
         translator.toLocation(event.lat, event.lng, function (cityName) {
            setLocation(cityName);
         });
      }

      function postConstruct() {
         publishLocation(settings.city);
      }
   }
   
})();
