/* exported loadedModulesContainer */
function loadedModulesContainer() {
   'use strict';

   var JOJ_ID_ATTRIBUTE_NAME = 'joj-id',
      modulesMap = {},
      modules = [],
      createJojId = (function() {
         var currentId = 0;

         return function() {
            return ++currentId;
         };
      })();

   function add(element, module) {
      var modulesListForElement,
         elementJojId = estimateElementsJojId(element);

      if(modulesMap.hasOwnProperty(elementJojId)) {
         modulesListForElement = modulesMap[elementJojId];
      }
      else {
         modulesListForElement = [];
         modulesMap[elementJojId] = modulesListForElement;
      }

      modulesListForElement.push(module);
      modules.push(module);
   }

   function estimateElementsJojId(element) {
      var elementJojId;

      if (element.hasAttribute(JOJ_ID_ATTRIBUTE_NAME)) {
         elementJojId = element.getAttribute(JOJ_ID_ATTRIBUTE_NAME);
      }
      else {
         elementJojId = createJojId();
         element.setAttribute(JOJ_ID_ATTRIBUTE_NAME, elementJojId);
      }

      return elementJojId;
   }

   function removeElement(element) {
      var elementJojId;

      if(element.hasAttribute(JOJ_ID_ATTRIBUTE_NAME)) {
         elementJojId = element.getAttribute(JOJ_ID_ATTRIBUTE_NAME);

         if(modulesMap.hasOwnProperty(elementJojId)) {
            delete modulesMap[elementJojId];
         }
      }
   }

   function getByElement(element) {
      var elementJojId = element.getAttribute(JOJ_ID_ATTRIBUTE_NAME);
      return modulesMap[elementJojId];
   }

   modules.add = add;
   modules.remove = removeElement;
   modules.get = getByElement;

   return modules;
}
