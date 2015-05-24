function locationChangedEvent(lat, lng) {
   return {
      name: 'LocationChanged',
      lat: lat,
      lng: lng
   };
}