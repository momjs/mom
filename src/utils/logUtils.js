/*exported logError */
function logError() {
   'use strict';

   if(console) {
      /* jshint validthis:true */
      console.error.apply(this, arguments);
   }
}
