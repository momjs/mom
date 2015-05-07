mom.createModule("location-selection")
   .dependencies(["event-bus"])
   .creator(function (domNode, eventBus) {
      var $selectBox = $(domNode);

      function getValue() {
         return $selectBox.val();
      }

      $selectBox.change(function () {
         //publish value
         
      });

      function onLocationChanged(event) {
         //change value
         
      }

   
      return {
         onLocationChanged: onLocationChanged
      };

   });




mom.initModulePage();