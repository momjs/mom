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
     persister.iterate(function(toDoItem) {
        createToDo(toDoItem);
     });
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