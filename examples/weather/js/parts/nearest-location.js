(function() {
   
   mom.createPart('nearest-location')
      .scope(mom.scope.lazySingleton)
      .creator(nearestLocation);

   
   function nearestLocation() {

      return {
         getLocation: getLocation
      };
      
      ////////////////////////////////////////////////////////
      
      function getLocation(callback) {
         if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
         } else {
            alert('browser dosen\'t support geolocalization');
         }

         function successFunction(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            callback(lat, lng);
         }

         function errorFunction() {
            alert('Geolocalization failed');
         }
      }
   }
})();
