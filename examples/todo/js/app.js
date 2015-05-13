(function() {
'use strict';

var removeCheckedEvent = {
      name: 'RemoveCheckedEvent',
};
   
mom.createPart('uuid')
   .creator(function() {
   var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
   
   return generate;

   function generate() {
      var uuid = template.replace(/[xy]/g, replaceRandom);
      
      return uuid;
   }
   
   function replaceRandom(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
   }
});
   
mom.createPart('todo-persister')
   .creator(function() {
   var TODO_PREFIX = 'todo';

   return {
      saveItem: saveItem,
      deleteItem: deleteItem,
      iterate: iterate
   };
   
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
});

mom.createModule('todo-adder')
   .dependencies(['uuid', 'todo-persister'])
   .creator(function(domElement, uuid, persister) {
   var addBtn = domElement.querySelector('.js-todo-adder-add');
   var content = domElement.querySelector('.js-todo-adder-content');
   var template='<div class="row valign-wrapper todo-item" modules="todo-item"><div class="col s10 valign"><input type="checkbox" class="filled-in js-todo-item-box" id="%id%" %checked%/><label for="%id%" class="js-todo-item-label">%text%</label></div><div class="col s2 valign todo-item-remove"><a class="waves-effect waves-light btn red js-todo-item-remove"><i class="mdi-content-clear"></i></a></div></div>';
   var enterKey = 13;
   
   addBtn.addEventListener('click', function() {
      addToDo();
      Materialize.updateTextFields();
      content.focus();
   });
   
   content.onkeypress = function(e) {
      if(!e) {
         e = window.event;
      }
      var keyCode = e.keyCode || e.which;
      if(keyCode === enterKey) {
         addToDo();
      }
   };
   
   return {
      postConstruct: postConstruct
   };
   
   function postConstruct() {
      setTimeout(function() {
         persister.iterate(function(toDoItem) {
            createToDo(toDoItem);
         });
      }, 0);
   }

   function addToDo() {
      var text = content.value;
      var toDo;
      
      if(text !== '') {
         toDo = {
            text: escapeHTML(text),
            id: uuid(),
            checked: false
         };
         createToDo(toDo);
         
         content.value='';
      }
   }
   
   function escapeHTML(text) {
      return text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
   }
   
   function createToDo(toDo) {
      var toDoHtml = template;
      var toDoElement;
      
      toDoHtml = toDoHtml.replace('%text%', toDo.text);
      toDoHtml = toDoHtml.replace(/%id%/g, toDo.id);
      toDoHtml = toDoHtml.replace('%checked%', (toDo.checked) ? 'checked' : '');
      
      toDoElement = createDomElement(toDoHtml);
      
      domElement.appendChild(toDoElement);
   }

   function createDomElement(string) {
      var div = document.createElement('div');
      div.innerHTML = string;
      return div.firstChild;
   }
});


mom.createModule('todo-item')
   .dependencies(['todo-persister'])
   .creator(function(domElement, persister) {
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
});

mom.createModule('todo-remove-checked')
   .dependencies(['event-bus'])
   .creator(function(domElement, eventBus) {
   
   domElement.addEventListener('click', function() {
      eventBus.publish(removeCheckedEvent);
   });
   
});


mom.initModulePage({
   domMutationSupport: true
});
   
})();