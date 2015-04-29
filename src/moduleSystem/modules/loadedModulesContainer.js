/* exported loadedModulesContainerCreator */
function loadedModulesContainerCreator(settings) {
   'use strict';

   var modulesMap = {},
      modules = [],
      createJojId = (function () {
         var currentId = 0;

         return function () {
            return ++currentId;
         };
      })();

   function getIdAttribute() {
      return settings.customIdAttribute;
   }

   function add(element, module) {
      var modulesListForElement,
         elementJojId = estimateElementsJojId(element);

      if (modulesMap.hasOwnProperty(elementJojId)) {
         modulesListForElement = modulesMap[elementJojId];
      } else {
         modulesListForElement = [];
         modulesMap[elementJojId] = modulesListForElement;
      }

      modulesListForElement.push(module);
      modules.push(module);
   }

   function estimateElementsJojId(element) {
      var idAttributeName = getIdAttribute(),
         elementJojId;

      if (element.hasAttribute(idAttributeName)) {
         elementJojId = element.getAttribute(idAttributeName);
      } else {
         elementJojId = createJojId();
         element.setAttribute(idAttributeName, elementJojId);
      }

      return elementJojId;
   }

   function removeElement(element) {
      var idAttributeName = getIdAttribute(),
         elementJojId;

      if (element.hasAttribute(idAttributeName)) {
         elementJojId = element.getAttribute(idAttributeName);

         if (modulesMap.hasOwnProperty(elementJojId)) {
            delete modulesMap[elementJojId];
         }
      }
   }

   function getByElement(element) {
      var idAttributeName = getIdAttribute(),
         elementJojId = element.getAttribute(idAttributeName);

      return modulesMap[elementJojId] || [];
   }

   modules.add = add;
   modules.remove = removeElement;
   modules.get = getByElement;

   return modules;
}