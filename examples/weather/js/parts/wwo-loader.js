(function() {
   
   mom.createPart('wwo-loader')
      .dependencies(['wwo-mapper'])
      .settings({
         k: 'e95b16b710ec21d99e0c5f2997885',
         url: '//api.worldweatheronline.com/free/v2/weather.ashx?callback=?',
      })
      .creator(wwoLoader);

   
   function wwoLoader(settings, mapper) {
      
      return {
         load: load
      };
      
      /////////////////////////////////////////////
      
      function load(lat, lng, callback) {
         var req = $.ajax({
            url: settings.url,
            data: {
               format: 'json',
               key: settings.k,
               q: lat + ',' + lng
            },
            dataType: 'jsonp',
            timeout: 10000,
            cache: true
         });

         req.success(function (data) {
            callback(mapper.map(data));
         });

         req.error(function () {
            alert('World Weather Online api not reachable. Wait for a while');
         });
      }
   }  
})();
