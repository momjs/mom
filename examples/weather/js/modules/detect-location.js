(function() {

   mom.createModule('detect-location')
      .dependencies(['nearest-location', 'event-bus'])
      .creator(detectLocation);
   
   
   function detectLocation(domElement, nearestLocation, eventBus) {
      var $detectLocation = $(domElement);

      $detectLocation.on('click', function () {
         nearestLocation.getLocation(function (lat, lng) {
            eventBus.publish(locationChangedEvent(lat, lng));

         });
      });
   }
   
})();
