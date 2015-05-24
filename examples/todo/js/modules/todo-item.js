(function() {
   
   mom.createModule('todo-item')
      .dependencies(['todo-persister'])
      .creator(todoItemfunction);
   
   
   function todoItemfunction(domElement, persister) {
      var checkbox = domElement.querySelector('.js-todo-item-box');
      var label = domElement.querySelector('.js-todo-item-label');
      var remove = domElement.querySelector('.js-todo-item-remove');
      var item = {
         id: checkbox.id,
         text: label.innerText,
         checked: checkbox.checked
      };

      render();
      save();

      remove.addEventListener('click', function() {
         removeItem();
      });


      checkbox.addEventListener('change', function() {
         item.checked = checkbox.checked;
         render();
         save();
      });


      return {
         onRemoveCheckedEvent: onRemoveChecked
      };
      
      /////////////////////////////////////////////////////////////

      function save() {
         persister.saveItem(item);
      }

      function render() {
         if(item.checked) {
            label.classList.add('todo-item--checked');
         } else {
            label.classList.remove('todo-item--checked');
         }
      }

      function removeItem() {
         domElement.parentElement.removeChild(domElement);
         persister.deleteItem(item.id);
      }

      function onRemoveChecked() {
         if(item.checked) {
            removeItem();
         }
      }
   }
   
})();
