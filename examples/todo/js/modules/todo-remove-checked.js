(function() {
   
   mom.createModule('todo-remove-checked')
      .dependencies(['event-bus'])
      .creator(todoRemoveChecked);
   
   
   function todoRemoveChecked(domElement, eventBus) {

      domElement.addEventListener('click', function() {
         eventBus.publish(removeCheckedEvent);
      });
   }
   
})();
