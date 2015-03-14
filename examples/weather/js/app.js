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

moduleSystem.createModule("set-location")
   .dependencies(["location-translator", "eventBus"])
   .settings({
      city: "New York"
   })
   .creator(function (domElement, settings, translator, eventBus) {
      var $location = $(domElement);

      setLocation(settings.city);

      $location.on("change", function () {
         var location = $location.val();

         if (location !== "") {
            publishLocation(location);
         }
      });

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

      return {
         onLocationChanged: onLocationChanged,
         postConstruct: postConstruct
      };
   });

moduleSystem.createModule("map")
   .dependencies(["eventBus"])
   .settings({})
   .creator(function (domElement, settings, eventBus) {
      var mapOptions = $.extend({
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            zoom: 8,
            streetViewControl: false,
            zoomControl: false
         }, settings.mapOptions),
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
         map.panTo(currCenter);
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
         "rgb(0, 142, 223)",
         "#918dc4",
         "#8dc4bc",
         "#c48d8d",
         "#c0c48d",
         "#0f2b88",
         "#cdd419"
      ]
   })
   .creator(function (domElement, settings) {
      var $domElement = $(domElement),
         currentIndex = 0;

      function onWeatherChanged() {
         $domElement.css("background-color", randomColor());
      }

      function randomColor() {
         var index;
         do {
            index = randomIndex();
         } while (index === currentIndex);

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
   .creator(function (domElement) {
      var $domElement = $(domElement);

      function render(weather) {
         var html = '<div class="weather"><span class="weather-text1">' + weather.description + '</span><img class="weather-image" src="' + weather.icon + '"><span class="weather-text2">' + weather.temp + ' °C</span></div>';

         $domElement.html(html);
      }


      function loading() {
         var html = '<div class="preloader-wrapper big active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>';

         $domElement.html(html);
      }


      function onWeatherChanged(event) {
         render(event.weather);
      }

      return {
         onLocationChanged: loading,
         onWeatherChanged: onWeatherChanged
      };
   });

moduleSystem.createModule("detect-location")
   .dependencies(["nearest-location", "eventBus"])
   .creator(function (domElement, nearestLocation, eventBus) {
      var $detectLocation = $(domElement);

      $detectLocation.on("click", function () {
         nearestLocation.getLocation(function (lat, lng) {
            eventBus.publish(locationChangedEvent(lat, lng));

         });
      });
   });

moduleSystem.createPart("weather-loader")
   .dependencies(["eventBus", "wwo-loader"])
   .scope(moduleSystem.scope.eagerSingleton)
   .creator(function (eventBus, loader) {
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

      eventBus.add({
         onLocationChanged: onLocationChanged
      });
   });

moduleSystem.createPart("owm-loader")
   .dependencies(["owm-mapper"])
   .settings({
      key: "2cb49277948a9e176a0edf968c0f9c91",
      url: "http://api.openweathermap.org/data/2.5/weather?callback=?",
      units: "metric" //imperial
   })
   .creator(function (settings, mapper) {
      function loadWeather(lat, lng, callback) {
         var req = $.ajax({
            url: settings.url,
            data: {
               units: settings.units,
               lat: lat,
               lon: lng,
               APPID: settings.key
            },
            cache: true,
            dataType: "jsonp",
            timeout: 10000
         });

         req.success(function (data) {
            callback(mapper.map(data));
         });

         req.error(function () {
            alert("Open Weather Map api not reachable. Wait for a while");
         });
      }


      return {
         load: loadWeather
      };
   });

moduleSystem.createPart("owm-mapper")
   .creator(function () {

      function map(weather) {
         var temp = weather.main.temp,
            description = weather.weather[0].description,
            icon = "//openweathermap.org/img/w/" + weather.weather[0].icon + ".png";


         return {
            supplier: "Open Weather Map",
            temp: temp,
            description: description,
            icon: icon
         };

      }

      return {
         map: map
      };
   });


moduleSystem.createPart("wwo-loader")
   .dependencies(["wwo-mapper"])
   .settings({
      k: "e95b16b710ec21d99e0c5f2997885",
      url: "//api2.worldweatheronline.com/free/v2/weather.ashx?callback=?",
   })
   .creator(function (settings, mapper) {
      function load(lat, lng, callback) {
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

         req.success(function (data) {
            callback(mapper.map(data));
         });

         req.error(function () {
            alert("World Weather Online api not reachable. Wait for a while");
         });
      }

      function onLocationChanged(event) {
         loadWeather(event.lat, event.lng);
      }

      return {
         load: load
      };
   });


moduleSystem.createPart("wwo-mapper")
   .creator(function () {

      function map(data) {
         var weather = data.data,
            current_condition = weather.current_condition[0],
            temp = current_condition.temp_C,
            description = current_condition.weatherDesc[0].value,
            icon = current_condition.weatherIconUrl[0].value;


         return {
            supplier: "World Weather Online",
            temp: temp,
            description: description,
            icon: icon
         };

      }

      return {
         map: map
      };
   });


moduleSystem.createPart("nearest-location")
   .scope(moduleSystem.scope.eagerSingleton)
   .creator(function () {

      function getLocation(callback) {
         if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
         } else {
            alert("browser dosen't support geolocalization");
         }

         function successFunction(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            callback(lat, lng);
         }

         function errorFunction() {
            alert("Geolocalization failed");
         }
      }

      return {
         getLocation: getLocation
      }
   });

moduleSystem.createPart("location-translator")
   .scope(moduleSystem.scope.lazySingleton)
   .creator(function ()  {
      var geocoder = new google.maps.Geocoder();

      function toCoordinates(cityName, callback) {
         geocoder.geocode({
            'address': cityName
         }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
               callback(results[0].geometry.location.lat(), results[0].geometry.location.lng());
            } else {
               alert("Could not find location: " + cityName);
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
               callback("");
            }
         });
      }



      return {
         toLocation: toLocation,
         toCoordinates: toCoordinates
      };


   });

moduleSystem.initModulePage();