(function() {
   
   mom.createModule('weather')
   .creator(weather);
   
   
   function weather(domElement) {
      var $domElement = $(domElement);
      
      return {
         onLocationChanged: loading,
         onWeatherChanged: onWeatherChanged
      };

      //////////////////////////////////////////////////////////
      
      function render(weather) {
         var html = '\
         <div class="weather">\
            <span class="weather-text1">' + weather.description + '</span>\
            <img class="weather-image" src="' + weather.icon + '">\
            <span class="weather-text2">' + weather.temp + ' °C</span>\
         </div>';

         $domElement.html(html);
      }

      function loading() {
         var html = '\
         <div class="preloader-wrapper big active">\
            <div class="spinner-layer spinner-blue-only">\
               <div class="circle-clipper left">\
                  <div class="circle"></div>\
               </div>\
               <div class="gap-patch">\
                  <div class="circle"></div>\
               </div>\
               <div class="circle-clipper right">\
                  <div class="circle"></div>\
               </div>\
            </div>\
         </div>';

         $domElement.html(html);
      }

      function onWeatherChanged(event) {
         render(event.weather);
      }
   }
   
})();
