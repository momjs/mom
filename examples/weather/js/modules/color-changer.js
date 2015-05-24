(function() {
   
   mom.createModule('color-changer')
      .settings({
         colors: [
            'rgb(0, 142, 223)',
            '#918dc4',
            '#8dc4bc',
            '#c48d8d',
            '#c0c48d',
            '#0f2b88',
            '#cdd419'
         ]
      })
      .creator(colorChanger);
   

   function colorChanger(domElement, settings) {
      var $domElement = $(domElement),
          currentIndex = 0;
      
      return {
         onWeatherChanged: onWeatherChanged
      };
      
      ///////////////////////////////////////////////////////////

      function onWeatherChanged() {
         $domElement.css('background-color', randomColor());
      }

      function randomColor() {
         var index;
         do {
            index = randomIndex();
         } while (index === currentIndex);

         return settings.colors[index];
      }

      function randomIndex() {
         return Math.floor(Math.random() * settings.colors.length);
      }
   }
   
})();
