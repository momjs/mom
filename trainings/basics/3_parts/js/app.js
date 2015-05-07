mom.createModule("weather")
   .dependencies(["weather-loader", "description-image-mapper"])
   .creator(function (domNode, weatherLoader, mapper) {
      var $domNode = $(domNode);

      function onLocationChanged(event) {
         //load weather
         //map image path
         //show weather
      }


      return {
         onLocationChanged: onLocationChanged
      };
   });


mom.createModule("location-selection")
   .dependencies(["eventBus"])
   .creator(function (selectBox, eventBus) {
      var $selectBox = $(selectBox);

      function getValue() {
         return $selectBox.val();
      }

      $selectBox.change(function () {
         //publish current value
      });


      function postConstruct() {
         //publish current location
      }

      return {
         postConstruct: postConstruct,
      };
   });


/**
 * Maps a Weather Description to an Image Path
 */
mom.createPart("description-image-mapper")
   .creator(function () {

      function map(description) {
         //implement mapping like:img/$description.png

         return description;
      }

   });



/**
 * Loads Data in Format:
 * {
 *   temp: 20,
 *   description: "rain",
 *   location: "München",
 * }
 * calls callback parameter on success
 */
mom.createPart("weather-loader")
   .creator(function () {


      function loadWeather(locationCode, callback) {
         $.getJSON("json/weather_" + locationCode + ".json", callback);
      }


      return {
         loadWeather: loadWeather
      };
   });




mom.initModulePage();