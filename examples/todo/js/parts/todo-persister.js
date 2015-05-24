(function() {
   
   mom.createPart('todo-persister')
      .creator(todoPersister);
   
   
   function todoPersister() {
      var TODO_PREFIX = 'todo';

      return {
         saveItem: saveItem,
         deleteItem: deleteItem,
         iterate: iterate
      };
      
      ////////////////////////////////////////////////////

      function get() {
         var todoJson = localStorage.getItem(TODO_PREFIX);
         if(!todoJson) {
            todoJson = '{}';
         }
         return JSON.parse(todoJson);
      } 

      function save(todo) {
         var todoJson = JSON.stringify(todo);
         localStorage.setItem(TODO_PREFIX, todoJson);
      }

      function saveItem(todoItem) {
         var todo = get();
         todo[todoItem.id] = todoItem;
         save(todo);
      }

      function deleteItem(id) {
         var todo = get();
         delete todo[id];
         save(todo);   
      }

      function iterate(callback) {
         var todo = get();
         var todoItem;

         for (var todoItemId in todo) {
            if (todo.hasOwnProperty(todoItemId)) {
               todoItem = todo[todoItemId];
               callback(todoItem);
            }
         }
      }
   }
   
})();
