/*exported createDescriptor */
function createDescriptor(name) {
   'use strict';

   if (typeof name !== 'string') {
      throw new Error('Name missing');
   }

   return {
      name: name
   };
}

/*exported creatorDescriptor */
function creatorDescriptor(name) {
   'use strict';

   var descriptor = createDescriptor(name);
   descriptor.type = constants.type.creator;
   descriptor.settings = undefined;
   descriptor.dependencies = [];
   descriptor.creator = undefined;

   return descriptor;
}