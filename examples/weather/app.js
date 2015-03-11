function detectLocation() {

   return {
      name: "DetectLocation",
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
      city: "New York",
   })
   .creator(function (domElement, settings, eventBus) {
      var $domElement = $(domElement),
         $cityName = $domElement.find(settings.selector);

      setCity(settings.city);

      $cityName.on("change", function () {
         var cityName = $cityName.val();

         eventBus.publish(cityNameChangedEvent(cityName));
      });

      function setCity(name) {
         $cityName.val(name);
      }

      function postConstruct() {
         eventBus.publish(cityNameChangedEvent(settings.city));
      }

      return {
         postConstruct: postConstruct
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
         marker;

      function onLocationChanged(event) {
         clearMarker();
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
         eventBus.publish(locationChangedEvent(event.latLng.lat(), event.latLng.lng()));
      });

      function clearMarker() {
         if (marker) {
            marker.setMap(null);
         }
      }

      return {
         onLocationChanged: onLocationChanged
      };
   });

moduleSystem.createModule("color-changer")
   .settings({
      colors: [
         "#c48d8d",
         "#918dc4",
         "#8dc4bc",
         "#c48d8d",
         "#c0c48d",
         "#0f2b88",
         "#cdd419"
      ]
   })
   .creator(function (domElement, settings) {
      var $domElement = $(domElement)
      var currentIndex = 0;

      function onWeatherChanged() {
         $domElement.css("background-color", randomColor());
      }

      function randomColor() {
         var index;
         do {
            index = randomIndex();
         } while (index !== currentIndex);

         return settings.colors[index];
      }

      function randomIndex() {
         return Math.floor(Math.random() * settings.colors.length);;
      }

      return {
         onWeatherChanged: onWeatherChanged
      };

   });


moduleSystem.createModule("weather")
   .dependencies(["weatherLoader"])
   .creator(function (domElement) {
      var $domElement = $(domElement);

      function render(weather) {
         var current_condition = weather.current_condition[0],
            description = current_condition.weatherDesc[0].value,
            icon = current_condition.weatherIconUrl[0].value,
            html = '<div class="weather">' + description + ' <img class="weather-image" src="' + icon + '"> ' + current_condition.temp_C + ' °C</div>';

         $domElement.html(html);
      }

      function onWeatherChanged(event) {
         render(event.weather);
      }

      return {
         onWeatherChanged: onWeatherChanged
      };
   });

moduleSystem.createModule("detectLocation")
   .dependencies(["eventBus"])
   .settings({
      selector: ".js-detect-location"
   })
   .creator(function (domElement, settings, eventBus) {
      var $domElement = $(domElement),
         $detectLocation = $domElement.find(settings.selector);

      $detectLocation.on("click", function () {
         eventBus.publish(detectLocation());
      });
   });

moduleSystem.createPart("weatherLoader")
   .dependencies(["eventBus"])
   .settings({
      k: "e95b16b710ec21d99e0c5f2997885",
      url: "//api.worldweatheronline.com/free/v2/weather.ashx?callback=?",
   })
   .creator(function (settings, eventBus) {
      function loadWeather(lat, lng) {
         var req = $.ajax({
            url: settings.url,
            data: {
               format: "json",
               key: settings.k,
               q: lat + "," + lng
            },
            dataType: "jsonp",
            timeout: 10000,
            cache: true
         });

         req.success(successFunction);

         req.error(function () {
            alert("weather api not reachable wait for a while");
         });


         function successFunction(data) {
            eventBus.publish(weatherChangedEvent(data.data));
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
         } else {
            alert("your browser dosen't support geolocalization");
         }
         //Get the latitude and the longitude;
         function successFunction(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            eventBus.publish(locationChangedEvent(lat, lng));
         }

         function errorFunction() {
            alert("Geolocalization failed");
         }
      }

      eventBus.add({
         onDetectLocation: getLocation
      });
   });

moduleSystem.createPart("cityLocation")
   .scope(moduleSystem.scope.eagerSingleton)
   .dependencies(["eventBus"])
   .creator(function (eventBus)  {
      var geocoder = new google.maps.Geocoder();


      function onCityNameChanged(event) {
         translateToCoordinates(event.cityName);
      }

      function translateToCoordinates(cityName) {
         geocoder.geocode({
            'address': cityName
         }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
               eventBus.publish(locationChangedEvent(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
            } else {
               alert("Could not find location: " + cityName);
            }
         });
      }


      eventBus.add({
         onCityNameChanged: onCityNameChanged
      });

   });

moduleSystem.initModulePage();