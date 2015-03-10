function useLocationChangedEvent(status) {

   return {
      name: "UseLocationChanged",
      status: status
   };
}

function cityNameChangedEvent(cityName) {
   return {
      name: "CityNameChanged",
      cityName: cityName
   };
}


function locationChangedEvent(lat, lng) {
   return {
      name: "LocationChanged",
      lat: lat,
      lng: lng
   };
}

function weatherChangedEvent(weather) {
   return {
      name: "WeatherChanged",
      weather: weather
   };
}

moduleSystem.createModule("cityName")
   .dependencies(["eventBus"])
   .settings({
      selector: ".js-city",
      city: "Berlin",
   })
   .creator(function (domElement, settings, eventBus) {
      var $domElement = $(domElement),
         $cityName = $domElement.find(settings.selector);

      $cityName.val(settings.city);

      $cityName.on("change", function () {
         var cityName = $cityName.val();

         eventBus.publish(cityNameChangedEvent(cityName));
      });

      function onUseLocationChanged(event) {
         $cityName.val('');
         $cityName.prop("disabled", event.status);
      }

      function postConstruct() {
         eventBus.publish(cityNameChangedEvent(settings.city));

      }

      return {
         postConstruct: postConstruct,
         onUseLocationChanged: onUseLocationChanged
      };
   });

moduleSystem.createModule("map")
   .dependencies(["eventBus"])
   .creator(function (domElement, eventBus) {
      var mapOptions = {
            zoom: 8
         },
         map = new google.maps.Map(domElement,
            mapOptions),
         geocoder = new google.maps.Geocoder(),
         marker;

      function onLocationChanged(event) {
         map.setCenter(event);
         marker = new google.maps.Marker({
            position: event,
            map: map
         });
      }

      $(window).on('resize', function () {
         var currCenter = map.getCenter();
         google.maps.event.trigger(map, 'resize');
         map.setCenter(currCenter);
      });


      google.maps.event.addListener(map, 'click', function (event) {
         if (marker) {
            marker.setMap(null);
         }
         marker = new google.maps.Marker({
            position: event.latLng,
            map: map
         });

         eventBus.publish(locationChangedEvent(event.latLng.lat(), event.latLng.lng()));
      })



      return {
         onLocationChanged: onLocationChanged
      };
   });


moduleSystem.createModule("weather")
   .dependencies(["weatherLoader"])
   .creator(function (domElement) {
      var $domElement = $(domElement);

      function render(weather) {
         var html = '<div class="weather">' + weather.weather[0].description + ' <img src="//openweathermap.org/img/w/' + weather.weather[0].icon + '.png"> ' + weather.main.temp + ' °C</div>';

         $domElement.html(html);
      }

      function onWeatherChanged(event) {
         render(event.weather);
      }

      return {
         onWeatherChanged: onWeatherChanged
      };
   });

moduleSystem.createModule("useLocation")
   .dependencies(["eventBus"])
   .settings({
      selector: ".js-use-location"
   })
   .creator(function (domElement, settings, eventBus) {
      var $domElement = $(domElement),
         $useLocation = $domElement.find(settings.selector);


      $useLocation.on("change", function () {
         var useLocation = $useLocation.is(":checked");

         eventBus.publish(useLocationChangedEvent(useLocation));
      });
   });

moduleSystem.createPart("weatherLoader")
   .dependencies(["eventBus"])
   .settings({
      url: "//api.openweathermap.org/data/2.5/weather?callback=?",
      units: "metric" //imperial
   })
   .creator(function (settings, eventBus) {
      function loadWeather(lat, lng) {
         $.getJSON(settings.url, {
            lat: lat,
            lon: lng,
            units: settings.units
         }, successFunction);

         function successFunction(data) {
            eventBus.publish(weatherChangedEvent(data));
         }

      }

      function onLocationChanged(event) {
         loadWeather(event.lat, event.lng);
      }

      eventBus.add({
         onLocationChanged: onLocationChanged
      });
   });


moduleSystem.createPart("nearestLocation")
   .scope(moduleSystem.scope.eagerSingleton)
   .dependencies(["eventBus"])
   .creator(function (eventBus) {
      function getLocation() {
         if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
         }
         //Get the latitude and the longitude;
         function successFunction(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            eventBus.publish(locationChangedEvent(lat, lng));
         }

         function errorFunction() {
            alert("Geocoder failed");
         }
      }

      function onUseLocationChanged(event) {
         var useLocation = event.status;

         if (useLocation) {
            getLocation();
         }
      }

      eventBus.add({
         onUseLocationChanged: onUseLocationChanged
      });
   });

moduleSystem.createPart("cityLocation")
   .scope(moduleSystem.scope.eagerSingleton)
   .dependencies(["eventBus"])
   .creator(function (eventBus)  {
      var geocoder = new google.maps.Geocoder();


      function onCityNameChanged(event) {
         geocoder.geocode({
            'address': event.cityName
         }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
               eventBus.publish(locationChangedEvent(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
            } else {
               alert("Could not find location: " + event.cityName);
            }
         });
      }


      eventBus.add({
         onCityNameChanged: onCityNameChanged
      });

   });




moduleSystem.initModulePage();