(function() {
   
   mom.createPart('location-translator')
      .scope(mom.scope.lazySingleton)
      .creator(locationTranslator);
   
   
   function locationTranslator()  {
      var geocoder = new google.maps.Geocoder();
      
      return {
         toLocation: toLocation,
         toCoordinates: toCoordinates
      };
      
      /////////////////////////////////////////////////////////

      function toCoordinates(cityName, callback) {
         geocoder.geocode({
            'address': cityName
         }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
               callback(results[0].geometry.location.lat(), results[0].geometry.location.lng());
            } else {
               alert('Could not find location: ' + cityName);
            }
         });
      }

      function toLocation(lat, lng, callback) {
         var latlng = new google.maps.LatLng(lat, lng);
         geocoder.geocode({
            'latLng': latlng
         }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
               callback(results[0].formatted_address);
            } else {
               callback('');
            }
         });
      }
   }
})();
