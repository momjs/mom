function createDescriptor(name) {
   if (typeof name !== 'string') {
      throw new Error('Name missing');
   }

   return {
      name: name
   };
}

function creatorDescriptor(name) {
   var descriptor = createDescriptor(name);
   descriptor.type = 'creator';
   descriptor.settings = undefined;
   descriptor.dependencies = [];
   descriptor.creator = undefined;

   return descriptor;
}
