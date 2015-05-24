(function() {
   
   mom.createModule('map')
      .dependencies(['event-bus'])
      .settings({
         smallOffSetX: 0,
         smallOffSetY: 100,
         smallWidthSize: 500
      })
      .creator(map);
   
   
   function map(domElement, settings, eventBus) {
      var mapOptions = $.extend({
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            zoom: 8,
            streetViewControl: false
      }, settings.mapOptions),
         map = new google.maps.Map(domElement,
            mapOptions),
         marker,
         small = 0,
         big = 1,
         $window = $(window),
         currentSize = getSize();
      
      
      $window.on('resize', function () {
         var center = map.getCenter();
         google.maps.event.trigger(map, 'resize');

         var size = getSize();
         //center correction if size changes
         if (currentSize !== size) {
            if (currentSize === small) {
               //change from samll to big
               //move center down
               center = getProjection(center, true);
            } else {
               //change from big to small 
               //move center up
               center = getProjection(center);
            }
            currentSize = size;
         }

         map.panTo(center);
      });

      google.maps.event.addListener(map, 'click', function (event) {
         eventBus.publish(locationChangedEvent(event.latLng.lat(), event.latLng.lng()));
      });
      
      return {
         onLocationChanged: onLocationChanged
      };
      
      ////////////////////////////////////////////////////////////////////////

      function onLocationChanged(event) {
         clearMarker();
         setCenter(new google.maps.LatLng(event.lat, event.lng));
         marker = new google.maps.Marker({
            position: event,
            map: map
         });
      }

      function setCenter(latLng) {
         if (getSize() === small) {
            map.panTo(latLng);
            latLng = getProjection(latLng);
         }
         map.panTo(latLng);
      }

      function getProjection(latLng, revertOffset) {
         var scale = Math.pow(2, map.getZoom()),
            offSetX = (revertOffset) ? -settings.smallOffSetX : settings.smallOffSetX,
            offSetY = (revertOffset) ? -settings.smallOffSetY : settings.smallOffSetY,
            nw = new google.maps.LatLng(
               map.getBounds().getNorthEast().lat(),
               map.getBounds().getSouthWest().lng()
            ),
            worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latLng),
            pixelOffset = new google.maps.Point((offSetX / scale) || 0, (offSetY / scale) || 0),
            worldCoordinateNewCenter = new google.maps.Point(
               worldCoordinateCenter.x - pixelOffset.x,
               worldCoordinateCenter.y + pixelOffset.y
            );

         return map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
      }

      function getSize() {
         var width = $window.width();
         if (width <= settings.smallWidthSize) {
            return small;
         } else {
            return big;
         }
      }

      function clearMarker() {
         if (marker) {
            marker.setMap(null);
         }
      }
   }

})();
