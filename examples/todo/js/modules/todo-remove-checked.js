mom.createModule('todo-remove-checked')
   .dependencies(['event-bus'])
   .creator(function(domElement, eventBus) {
   
   domElement.addEventListener('click', function() {
      eventBus.publish(removeCheckedEvent);
   });
   
});