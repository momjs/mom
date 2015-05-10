(function() {
'use strict';

var removeCheckedEvent = {
      name: 'RemoveCheckedEvent',
};

mom.createModule('todo-adder')
   .creator(function(domElement) {
   var addBtn = domElement.querySelector('.js-todo-adder-add');
   var content = domElement.querySelector('.js-todo-adder-content');
   var template='<div class="row valign-wrapper" modules="todo-item"><div class="col s10 valign"><input type="checkbox" class="filled-in js-todo-item-box" id="todo%i%"/><label for="todo%i%" class="js-todo-item-label">%text%</label></div><div class="col s2 valign"><a class="waves-effect waves-light btn red js-todo-item-remove"><i class="mdi-content-clear"></i></a></div></div>',
       i=0;
   var enterKey = 13;

   addBtn.addEventListener('click', function() {
      addToDo();
      Materialize.updateTextFields();
      content.focus();
   });
   
   content.onkeypress = function(e){
      if (!e) {
         e = window.event;
      }
      var keyCode = e.keyCode || e.which;
      if (keyCode === enterKey){
         addToDo();
      }
   };
   
   function addToDo() {
      var text = content.value;
      var toDo;
      
      if(text !== '') {
         toDo = createToDo(text);
         domElement.appendChild(toDo);
         content.value='';
      }
   }
   

   function createToDo(text) {
      var replacedText = template.replace('%text%', text);
      var item = replacedText.replace(/%i%/g, i++);
      return createDomElement(item);
   }

   function createDomElement(string) {
      var div = document.createElement('div');
      div.innerHTML = string;
      return div.firstChild;
   }
});


mom.createModule('todo-item')
   .creator(function(domElement) {
   var checkbox = domElement.querySelector('.js-todo-item-box');
   var checked = checkbox.checked;
   var label = domElement.querySelector('.js-todo-item-label');
   var remove = domElement.querySelector('.js-todo-item-remove');
   
   render();
   
   remove.addEventListener('click', function() {
      removeItem();
   });
   
   checkbox.addEventListener('change', function() {
      checked = checkbox.checked;
      render();
   });
   
   function removeItem() {
      domElement.parentElement.removeChild(domElement);
   }
   

   function render() {
      if(checked) {
         label.classList.add('todo-item--checked');
      } else {
         label.classList.remove('todo-item--checked');
      }
   }
   
   function onRemoveChecked() {
      if(checked) {
         removeItem();
      }
   }
   
   return {
      onRemoveCheckedEvent: onRemoveChecked
   };
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