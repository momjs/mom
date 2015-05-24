(function() {
   
   mom.createPart('wwo-mapper')
      .creator(wwoMapper);
   
   
   function wwoMapper() {
      
      return {
         map: map
      };
      
      ///////////////////////////////////////////////////////

      function map(data) {
         var weather = data.data,
            current_condition = weather.current_condition[0],
            temp = current_condition.temp_C,
            description = current_condition.weatherDesc[0].value,
            icon = current_condition.weatherIconUrl[0].value;


         return {
            supplier: 'World Weather Online',
            temp: temp,
            description: description,
            icon: icon
         };

      }
   }
})();
