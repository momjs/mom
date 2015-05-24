(function() {
   
   mom.createPart('uuid')
      .creator(uuid);
   
   
   function uuid() {
      var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

      return generate;
      
      //////////////////////////////////////////////////////

      function generate() {
         var uuid = template.replace(/[xy]/g, replaceRandom);

         return uuid;
      }

      function replaceRandom(c) {
         var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
         return v.toString(16);
      }
   }
   
})();
