/**
 * mom
 * Dynamic Loading of Javascript based on DOM elements
 * @version v1.1.0 - 2015-06-17 * @link 
 * @author mom <https://github.com/momjs/mom>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 *//* jshint ignore:start */
;
(function (window, document, undefined) {   
/* jshint ignore:end */

/* exported getDOMSettings */

/**
 * Searches in the given element for the selector and parses it's content as JSON
 *
 * @param   {element} element  the element to search in
 * @param   {string} selector the selector to search for
 * @param   {string} name of the element to parse
 * @returns {object} JSON paresed content of element
 * @throws {Error} if the content of the element is not valid json
 */
function getDOMSettings(element, selector, name) {
   'use strict';

   var settingsScript = element.querySelector(selector),
      settingsAsHtml,
      domSettings;

   if (settingsScript !== null) {
      settingsAsHtml = settingsScript.innerHTML;
      try {
         domSettings = JSON.parse(settingsAsHtml);
      } catch (e) {
         throw new Error('Module [' + name + '] has invalid json in dom. Message: ' + e.message);
      }
   }

   return domSettings;
}

/*exported each */
/*exported contains */
/*exported isArray */
/* exported remove */

/**
 * Iterates the array and callback function for each element.
 * Uses native forEach if present
 *
 * @param {Array} array - the array to iterate
 * @param {eachCallback} - callback the callback function:
 */
var each = (function () {
   'use strict';

   function native(array, callback) {
      Array.prototype.forEach.call(array, callback);
   }

   function polyfill(array, callback) {
      var index,
         length = array.length,
         element,
         breakLoop;

      for (index = 0; index < length; index++) {
         element = array[index];

         breakLoop = callback(element, index, array);

         if (breakLoop) {
            break;
         }
      }
   }

   return (Array.prototype.forEach) ? native : polyfill;
})();

/**
 * Indicates if the specified element looking for is containing in the specified array.
 *
 * @param {array} array - the array to lookup
 * @param elementToSearch - the element to lookup
 * @returns {boolean} true if the array contains the element, false if not
 */
function contains(array, elementToSearch) {
   'use strict';

   var isContaining = false;

   each(array, function (element) {
      if (element === elementToSearch) {
         isContaining = true;
         return true;
      }
   });

   return isContaining;
}

/**
 * Indicates if the passed object is an Array.
 *
 * @param object - the object which will be checked to be an Array
 * @returns {boolean} true if the passed object is an Array, false if not
 */
function isArray(object) {
   'use strict';

   return Object.prototype.toString.call(object) === '[object Array]';
}

/**
 * Remove the passed element from the passed array
 * @param array the array to remove the passed element
 * @param element the element which will be removed from the passed array
 * @returns {boolean} returns true if the element has been removed, returns false otherwise
 */
function remove(array, element) {
   'use strict';

   var index = array.indexOf(element);

   if (index > -1) {
      array.splice(index, 1);
      return true;
   }

   return false;
}

/*exported eachProperty*/
/*exported merge */
/**
 * Iterates over all own properties of the specified object.
 *
 * @param {object} object - to iterate over
 * @param {eachPropertyCallback} callback - function which will be called for each property key and value
 */
function eachProperty(object, callback) {
   'use strict';

   var key,
      value,
      breakup;

   for (key in object) {
      if (object.hasOwnProperty(key)) {

         value = object[key];
         breakup = callback(value, key);

         if (breakup) {
            break;
         }
      }
   }
}
/**
 * @callback eachPropertyCallback
 * @param value - the value of the property
 * @param {string} key - the key of the property
 * @returns {undefined | boolean} if returns true the iteration breaks up immediately
 */


/**
 * Merges a variable list of inputs into the given mergeInto object.
 * Objects from later arguments overrides properties from earlier Objects
 *
 * @param {object} mergeInto - the object to merge into
 * @param {...object} objects - the objects to merge
 * @returns {object} the merged object
 */
function merge(mergeInto) {
   'use strict';

   each(arguments, function (argument, index) {
      if (index > 0) {

         eachProperty(argument, function (value, key) {
            mergeInto[key] = value;
         });
      }
   });

   return mergeInto;
}

/* exported callAsync */

/**
 * Calls the given function asynchronously
 *
 * @param {function} function - to execute async
 * @param {number} delay - optional execution deleay in milliseconds
 */
function callAsync(functionPointer, delay) {
   'use strict';

   var actualTimeout = delay || 0;

   setTimeout(functionPointer, actualTimeout);
}

/* exported trim */
/* exported stringContains */

/**
 * Removes whitespaces from both sides of a string
 * the function does not modify the content of the sting
 * uses nativ trim if present
 * @param {string} text - input string
 * @returns {string} the modified string
 */
var trim = (function () {
   'use strict';

   function polyfill(text) {
      return text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
   }

   function native(text) {
      return String.prototype.trim.call(text);
   }

   return (String.prototype.trim) ? native : polyfill;
})();

/**
 * Searches in text for value returns true if value is found.
 * false if not
 * @param {string} text - input string
 * @param {string} value - the value to search
 * @returns {boolean} conatins
 */
function stringContains(text, value) {
   'use strict';

   return text.indexOf(value) > -1;
}

/* exported matchesSelector */

/**
 * Test if the given element matches the given selector
 *
 * @param {element} element - to test
 * @param {String} selector
 * @returns {boolean} true when element matches selector
 */
var matchesSelector = (function () {
   'use strict';

   var ElementPrototype = Element.prototype,
      nativeFunction = ElementPrototype.matches ||
      ElementPrototype.matchesSelector ||
      ElementPrototype.mozMatchesSelector ||
      ElementPrototype.msMatchesSelector ||
      ElementPrototype.oMatchesSelector ||
      ElementPrototype.webkitMatchesSelector;

   function nativeCall(element, selector) {
      return nativeFunction.call(element, selector);
   }

   function polyfill(element, selector) {
      var parentElement = element.parentNode || element.document,
         selectedElements = parentElement.querySelectorAll(selector);

      return contains(selectedElements, element);
   }

   return (nativeFunction) ? nativeCall : polyfill;
})();

/*exported constants */
var constants = {
   scope: {
      lazySingleton: 'lazy-singleton',
      eagerSingleton: 'eager-singleton',
      multiInstance: 'multi-instance'
   },
   type: {
      returns: 'returns',
      creator: 'creator'
   }
};

/*exported createDescriptor */
function createDescriptor(name) {
   'use strict';

   if (typeof name !== 'string') {
      throw new Error('Name missing');
   }

   return {
      name: name
   };
}

/*exported creatorDescriptor */
function creatorDescriptor(name) {
   'use strict';

   var descriptor = createDescriptor(name);
   descriptor.type = constants.type.creator;
   descriptor.settings = undefined;
   descriptor.dependencies = [];
   descriptor.creator = undefined;

   return descriptor;
}

/*exported settingsCreator */
function settingsCreator() {
  'use strict';

  var settings = {
    rootNode: document,
    defaultScope: constants.scope.multiInstance,
    moduleSettingsSelector: 'script[type="%name%/settings"],script[type="true/%name%/settings"]',
    partSettingsSelector: 'head script[type="%name%/settings"]',
    attribute: 'modules',
    selector: '[%attribute%]',
    domMutationSupport: false,
    customIdAttribute: 'mom-id'
  };

  init();

  return settings;

  //////////////////////////////////////////////////////////

  function init() {
    settings.actualSelector = replacePlaceholder(settings.selector, 'attribute', settings.attribute);
    settings.mergeWith = mergeWith;
    settings.getModuleSettingsSelector = getModuleSettingsSelelector;
    settings.getPartSettingsSelector = getPartSettingsSelector;
  }


  function getModuleSettingsSelelector(moduleName) {
    return replacePlaceholder(settings.moduleSettingsSelector, 'name', moduleName);
  }

  function getPartSettingsSelector(partName) {
    return replacePlaceholder(settings.partSettingsSelector, 'name', partName);
  }

  function replacePlaceholder(text, placeholder, value) {
    var actualPlaceholder = '%' + placeholder + '%';
    var regEx;
    var result = text;

    if (stringContains(text, actualPlaceholder)) {
      regEx = new RegExp(actualPlaceholder, 'g');

      result = text.replace(regEx, value);
    }

      return result;
   }

  function mergeWith(newSettings) {
    merge(settings, newSettings);
    init();
  }
}

/*exported moduleLoaderCreator */
function moduleLoaderCreator(moduleAccess, partAccess, domEventListener, settings) {
   'use strict';

   function initModulePage() {
      var selector = settings.actualSelector,
         modulesOnPage = settings.rootNode.querySelectorAll(selector);

      partAccess.initEagerSingletons();

      each(modulesOnPage, function (element) {
         initModule(element);
      });
     
      if (settings.domMutationSupport === true) {
          domEventListener.registerToEvents();
      }

      partAccess.provisionFinished();
      moduleAccess.provisionFinished();
   }

   function initModule(element) {
      moduleAccess.provisionModule(element);
   }

   return {
      initModulePage: initModulePage,
      initModule: initModule
   };
}

/*exported moduleBuilderCreator */
function moduleBuilderCreator(moduleAccess) {
   'use strict';

   function createModule(name) {
      var descriptor = creatorDescriptor(name);

      return {
         settings: addSettings,
         dependencies: addDependencies,
         creator: addCreator
      };

      function addCreator(creator) {

         if(typeof creator !== 'function') {
            throw new Error('You have to pass the creator as a reference to a function');
         }

         descriptor.creator = creator;
         save();
      }

      function addSettings(settings) {

         if(settings !== undefined && typeof settings !== 'object') {
            throw new Error('You have to pass the settings as an object');
         }

         descriptor.settings = settings;

         return {
            dependencies: addDependencies,
            creator: addCreator
         };
      }

      function save() {
         moduleAccess.addModuleDescriptor(descriptor);
      }


      function addDependencies(dependencies) {

         if(dependencies !== undefined && !isArray(dependencies) ) {
            throw new Error('You have to pass the dependencies as an Array');
         }

         descriptor.dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator
         };
      }
   }

   return createModule;
}

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

/*exported modulesCreator */
function modulesCreator(partAccess, eventBus, loadedModules, settings) {
   'use strict';

  var availableModuleDescriptors = {},
      calledPostConstructs = [];

  return {
    provisionModule: initializeModules,
    unloadModules: unloadModules,
    provisionFinished: callPostConstructs,
    addModuleDescriptor: addModuleDescriptor,
    getModuleDescriptor: getModuleDescriptor
  };

  /////////////////////////////////////////////////////////////////////////

   function addModuleDescriptor(moduleDescriptor) {
      availableModuleDescriptors[moduleDescriptor.name] = moduleDescriptor;
   }

   function initializeModules(element) {
      var moduleNames = element.getAttribute(settings.attribute),
         moduleNamesArray = moduleNames.split(',');

      each(moduleNamesArray, function (moduleName) {
         moduleName = trim(moduleName);
         initializeModule(element, moduleName);
      });
   }

   function initializeModule(element, moduleName) {
      var moduleDescriptor,
         foundDependencies;

      //check if module to be loaded is registered
      if (availableModuleDescriptors.hasOwnProperty(moduleName)) {
         moduleDescriptor = availableModuleDescriptors[moduleName];

         foundDependencies = partAccess.getParts(moduleDescriptor.dependencies);

         buildModule(element, moduleDescriptor, foundDependencies);
      } else {
         throw new Error('Module [' + moduleName + '] not created but found in dom');
      }
   }

   function buildModule(element, moduleDescriptor, foundDependencies) {
      var args = foundDependencies,
         moduleName = moduleDescriptor.name,
         actualSelector = settings.getModuleSettingsSelector(moduleName),
         domSettings = getDOMSettings(element, actualSelector, moduleDescriptor.name),
         mergedSettings = {},
         createdModule;

      if (moduleDescriptor.settings !== undefined || domSettings !== undefined) {
         //override module settings with found dom settings into new object
         merge(mergedSettings, moduleDescriptor.settings, domSettings);

         args.unshift(mergedSettings);
      }

      //make moduleDomElement first arguments
      args.unshift(element);

      //create Module
      createdModule = moduleDescriptor.creator.apply(moduleDescriptor, args);

      if (createdModule !== undefined) {

         loadedModules.add(element, createdModule);

         //add module to eventBus
         eventBus.add(createdModule);
      }
   }

   function callPostConstructs() {
      each(loadedModules, function (module) {
         callPostConstruct(module);
      });
   }

   function callPostConstruct(module) {
      var postConstruct = module.postConstruct;
      if (typeof postConstruct === 'function') {
         if (!contains(calledPostConstructs, postConstruct)) {
            postConstruct();
            calledPostConstructs.push(postConstruct);
         }
      }
   }

   function unloadModules(element) {
      var modulesToUnload = loadedModules.get(element);

      each(modulesToUnload, function (module) {

         if (typeof module.preDestruct === 'function') {
            module.preDestruct();
         }
      });

      each(modulesToUnload, function (module) {
         eventBus.remove(module);
      });

      loadedModules.remove(element);
   }

   function getModuleDescriptor(moduleName) {
      var descriptor = availableModuleDescriptors[moduleName];
      if(!descriptor) {
        throw new Error('tried to load ' + moduleName + ' module descriptor, but was not registered');
      }

      return descriptor;
   }
}

/* exported domEventListenerCreator */
function domEventListenerCreator(settings, modules, parts) {
   'use strict';

   var registerStrategy = decideDomMutationStrategy();
   var ELEMENT_NODE = (window.Node) ? Node.ELEMENT_NODE : 1; //ie8 node is undefined

   function decideDomMutationStrategy() {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
         strategy;

      if (MutationObserver) {
         strategy = createMutationObserverStrategy(MutationObserver);
      } else {
         strategy = createLegacyDomMutationStrategy();
      }

      return strategy;
   }

   function onElementAdded(addedNode) {
     if(addedNode.nodeType === ELEMENT_NODE) {
       if (containsNode(settings.rootNode, addedNode)) {
         var addedModules = querySelectorAll(addedNode, settings.actualSelector);

         if (matchesSelector(addedNode, settings.actualSelector)) {
            loadModule(addedNode);
         }

         each(addedModules, function (addedModule) {
            loadModule(addedModule);
         });

         modules.provisionFinished();
         parts.provisionFinished();
      }
     }
   }

   function containsNode(parentNode, node) {

      if (parentNode === document) {
         return document.body.contains(node);
      } else {
         return parentNode.contains(node);
      }
   }

   function onElementRemoved(removedElement) {
      if(removedElement.nodeType === ELEMENT_NODE) {
        var addedModuleElements = querySelectorAll(removedElement, settings.actualSelector);

        each(addedModuleElements, function (moduleElement) {
           unloadModules(moduleElement);
        });

        if (matchesSelector(removedElement, settings.actualSelector)) {
           unloadModules(removedElement);
        }
      }
   }

   function onElementReplaced(newElement, oldElement) {
      onElementAdded(newElement);
      onElementRemoved(oldElement);
   }


   function querySelectorAll(element, selector) {

      if (element.querySelectorAll) {
         return element.querySelectorAll(selector);
      }

      return [];
   }

   function loadModule(moduleElement) {
      return modules.provisionModule(moduleElement);
   }

   function unloadModules(moduleElement) {
      modules.unloadModules(moduleElement);
   }

   return {
      registerToEvents: registerStrategy.register,
      unregisterToEvents: registerStrategy.unregister
   };

   function createMutationObserverStrategy(ObserverCreator) {

      var observerConfig = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
         },
         observer = new ObserverCreator(onMutation);

      function registerToEvents() {
         observer.observe(settings.rootNode, observerConfig);
      }

      function unregisterToEvents() {
         observer.takeRecords();
         observer.disconnect();
      }

      function onMutation(mutations, observer) {
         var addedNodes, removedNodes;

         each(mutations, function (mutationRecord) {
            addedNodes = mutationRecord.addedNodes;
            removedNodes = mutationRecord.removedNodes;

            /* on Safari 6 the added nodes may be null */
            if(addedNodes !== null) {
               each(addedNodes, function (addedNode) {
                  onElementAdded(addedNode);
               });
            }

            /* on Safari 6 the removed nodes may be null */
            if(removedNodes !== null) {
               each(removedNodes, function (removedNode) {
                  onElementRemoved(removedNode);
               });
            }
         });

         observer.takeRecords();
      }

      return {
         register: registerToEvents,
         unregister: unregisterToEvents
      };
   }

   function createLegacyDomMutationStrategy() {

      var appendChild = Element.prototype.appendChild,
         insertBefore = Element.prototype.insertBefore,
         removeChild = Element.prototype.removeChild,
         replaceChild = Element.prototype.replaceChild;

      function registerToEvents() {

         Element.prototype.appendChild = function (newElement, element) {
            var result = appendChild.call(this, newElement, element);

            callAsync(function() {
               onElementAdded(newElement);
            });

            return result;
         };

         Element.prototype.insertBefore = function (newElement, element) {
            var result = insertBefore.call(this, newElement, element);

            callAsync(function() {
               onElementAdded(newElement);
            });

            return result;
         };

         Element.prototype.removeChild = function (newElement, element) {
            var result = removeChild.call(this, newElement, element);

            callAsync(function() {
               onElementRemoved(newElement);
            });

            return result;
         };

         Element.prototype.replaceChild = function (newElement, oldElement) {
            var result = replaceChild.call(this, newElement, oldElement);

            callAsync(function() {
               onElementReplaced(newElement, oldElement);
            });

            return result;
         };
      }

      function unregisterToEvents() {

         Element.prototype.appendChild = function (newElement, element) {
            return appendChild.call(this, newElement, element);
         };

         Element.prototype.insertBefore = function (newElement, element) {
            return insertBefore.call(this, newElement, element);
         };


         Element.prototype.removeChild = function (newElement, element) {
            return removeChild.call(this, newElement, element);
         };

         Element.prototype.replaceChild = function (newElement, oldElement) {
            return replaceChild.call(this, newElement, oldElement);
         };
      }

      return {
         register: registerToEvents,
         unregister: unregisterToEvents
      };
   }
}

/*exported partBuilderCreator */
function partBuilderCreator(partAccess, moduleSystemSettings) {
   'use strict';

   var scopes = constants.scope,
      SCOPE_LAZY_SINGLETON = scopes.lazySingleton,
      SCOPE_EAGER_SINGLETON = scopes.eagerSingleton,
      SCOPE_MULTI_INSTANCE = scopes.multiInstance;

   return createPart;

   //////////////////////////////////////////////////////////////////////////////////////

   function createPart(name) {
      var descriptor;

      return {
         settings: addSettings,
         dependencies: addDependencies,
         creator: addCreator,
         returns: addReturns,
         scope: addScope
      };

      ///////////////////////////////////////////////////////////////////////////////////

      function addCreator(creator) {

         if(typeof creator !== 'function') {
            throw new Error('You have to pass the creator as a reference to a function');
         }

         getOrInitCreatorDiscriptor().creator = creator;
         save();
      }

      function addReturns(returns) {

         if(returns === undefined) {

            throw new Error('You have to pass the returns as one of these object types: string|integer|float|boolean|object|function|Array');
         }

         descriptor = returnsDescriptor(name);
         descriptor.returns = returns;
         save();
      }

      function addScope(scope) {

         if(SCOPE_LAZY_SINGLETON !== scope && SCOPE_EAGER_SINGLETON !== scope && SCOPE_MULTI_INSTANCE !== scope) {
            throw new Error('You have to pass the scope as one of these: lazy-singleton|eager-singleton|multi-instance');
         }

         var descriptor = getOrInitCreatorDiscriptor();

         if (scope !== undefined) {
            descriptor.scope = scope;
         }

         return {
            settings: addSettings,
            dependencies: addDependencies,
            creator: addCreator,
            returns: addReturns
         };
      }

      function addSettings(settings) {

         if(settings !== undefined && typeof settings !== 'object') {
            throw new Error('You have to pass the settings as an object');
         }

         getOrInitCreatorDiscriptor().settings = settings;

         return {
            dependencies: addDependencies,
            creator: addCreator,
            scope: addScope
         };
      }

      function addDependencies(dependencies) {

         if(dependencies !== undefined && !isArray(dependencies) ) {
            throw new Error('You have to pass the dependencies as an Array');
         }

         getOrInitCreatorDiscriptor().dependencies = dependencies;

         return {
            settings: addSettings,
            creator: addCreator,
            scope: addScope
         };
      }

      function getOrInitCreatorDiscriptor() {
         if (descriptor === undefined) {
            descriptor = partDescriptor(name);
         }

         return descriptor;
      }

      function save() {
         partAccess.addPartDescriptor(descriptor);
      }
   }

   function returnsDescriptor(name) {
      var descriptor = createDescriptor(name);

      descriptor.type = constants.type.returns;
      descriptor.scope = SCOPE_LAZY_SINGLETON;
      descriptor.returns = undefined;

      return descriptor;
   }

   function partDescriptor(name) {
      var descriptor = creatorDescriptor(name);
      descriptor.scope = moduleSystemSettings.defaultScope;

      return descriptor;
   }
}

/*exported partsCreator */
function partsCreator(settings) {
   'use strict';

   var loadedSingletonParts = {},
      loadedParts = [],
      buildingParts = {},
      availablePartDescriptors = {},
      calledPostConstructs = [];


   return {
      initEagerSingletons: initEagerSingletons,
      getPartDescriptor: getPartDescriptor,
      provisionPart: provisionPart,
      getParts: getOrInitializeParts,
      provisionFinished: callPostConstructs,
      addPartDescriptor: addPartDescriptor
   };

   ///////////////////////////////////////////////////////////////////////////////////////////

   function addPartDescriptor(partDescriptor) {
      availablePartDescriptors[partDescriptor.name] = partDescriptor;
   }

   function initEagerSingletons() {
      var eagerSingletonPartNames = [];

      eachProperty(availablePartDescriptors, function (partDescriptor, partName) {
         if (partDescriptor.scope === constants.scope.eagerSingleton) {
            eagerSingletonPartNames.push(partName);
         }
      });

      getOrInitializeParts(eagerSingletonPartNames);
   }


   function getOrInitializeParts(partNames) {
      var parts = [];

      each(partNames, function (partName) {
         var part = getOrInitializePart(partName);
         parts.push(part);
      });

      return parts;
   }

   function getOrInitializePart(partName) {
      var partDescriptor,
         constructionStrategy,
         part;

      if (availablePartDescriptors.hasOwnProperty(partName)) {
         buildingStart(partName);

         partDescriptor = availablePartDescriptors[partName];
         constructionStrategy = getConstructionStrategy(partDescriptor.scope);
         part = constructionStrategy(partDescriptor);

         buildingFinished(partName);
      }
      else if (window && window[partName]) {

        partDescriptor = {
          name : partName,
          scope : constants.scope.eagerSingleton,
          type : constants.type.returns,
          returns: window[partName]
        };

        part = singletonConstructionStrategy(partDescriptor);
      }
      else {
         throw new Error('tried to load ' + partName + ' but was not registered');
      }

      return part;
   }

   function buildingStart(partName) {
      var INDICATEBUILDING = true;
      if (buildingParts.hasOwnProperty(partName)) {
         throw new Error('Circular dependency detected for part [' + partName + ']');
      } else {
         buildingParts[partName] = INDICATEBUILDING;
      }
   }

   function buildingFinished(partName) {
      delete buildingParts[partName];
   }

   function getConstructionStrategy(scope) {
      switch (scope) {
      case constants.scope.multiInstance:
         return multiInstanceConstructionStrategy;
      case constants.scope.lazySingleton:
      case constants.scope.eagerSingleton:
         return singletonConstructionStrategy;
      default:
         throw new Error('unknown scope [' + scope + ']');
      }
   }

   function multiInstanceConstructionStrategy(partDescriptor) {
      var part,
         builder = getBuilder(partDescriptor.type);

      part = builder(partDescriptor);

      loadedParts.push(part);

      return part;
   }

   function singletonConstructionStrategy(partDescriptor) {
      var partName = partDescriptor.name,
         part = loadedSingletonParts[partName];

      if (part === undefined) {
         part = multiInstanceConstructionStrategy(partDescriptor);
         loadedSingletonParts[partName] = part;
      }

      return part;
   }


   function getBuilder(type) {
      switch (type) {
      case constants.type.returns:
         return buildReturnsPart;
      case constants.type.creator:
         return buildCreatorPart;
      default:
         throw new Error('unknown type [' + type + ']');
      }
   }

   function buildReturnsPart(partDescriptor) {
      return partDescriptor.returns;
   }

   function buildCreatorPart(partDescriptor) {
      var partName = partDescriptor.name,
         actualSelector = settings.getPartSettingsSelector(partName),
         domSettings = getDOMSettings(document, actualSelector, partDescriptor.name),
         mergedSettings = {},
         dependencies,
         foundDependencies,
         args,
         createdPart;

      dependencies = partDescriptor.dependencies;
      foundDependencies = getOrInitializeParts(dependencies);

      //initialize Parts here
      args = foundDependencies;
      // add settings from descriptor
      if (partDescriptor.settings !== undefined || domSettings !== undefined) {
         merge(mergedSettings, partDescriptor.settings, domSettings);
         args.unshift(mergedSettings);
      }

      // create part
      createdPart = partDescriptor.creator.apply(partDescriptor, args);

      if (createdPart === undefined) {
         createdPart = {};
      }

      return createdPart;
   }

   function callPostConstructs() {
      eachProperty(loadedParts, function (part) {
         callPostConstruct(part);
      });
   }

   function callPostConstruct(part) {
      var postConstruct = part.postConstruct;
      if (typeof postConstruct === 'function') {
         if(!contains(calledPostConstructs, postConstruct)) {
            postConstruct();
            calledPostConstructs.push(postConstruct);
         }
      }
   }

   function provisionPart(partName) {
      var part = getOrInitializePart(partName);
      callPostConstruct(part);

      return part;
   }

   function getPartDescriptor(partName) {
      var descriptor = availablePartDescriptors[partName];
      if(!descriptor) {
        throw new Error('tried to load ' + partName + ' part descriptor, but was not registered');
      }

      return descriptor;
   }
}

/*exported eventBusCreator */
function eventBusCreator() {
   'use strict';

   var ON_EVENT_FUNCTION_NAME = 'onEvent',
      listeners = [];

   function publishEvent(event) {

      if (event === undefined) {
         throw new Error('Published event cannot be undefined');
      }

      var callbackFunctionName = 'on' + event.name;

      each(listeners, function (listener) {

         if (event.name !== undefined) {
            tryToCallListener(listener, callbackFunctionName, event);
         }

         tryToCallListener(listener, ON_EVENT_FUNCTION_NAME, event);
      });
   }

   function tryToCallListener(listener, functionName, event) {

      var callback = listener[functionName];

      if (typeof callback === 'function') {
         callback.call(listener, event);
      }
   }

   function addListener(listener) {
      if (listener === undefined) {
         throw new Error('Listener to be registered is undefined');
      }

      if (contains(listeners, listener)) {
         throw new Error('Listener is already registered');
      }

      listeners.push(listener);
   }

   function removeListener(listener) {
      if(listener === undefined) {
         throw new Error('Listener to be removed is undefined');
      }

      var hasBeenRemoved = remove(listeners, listener);

      if(!hasBeenRemoved) {
         throw new Error('Listener to be removed is not registered');
      }
   }

   function reset() {
      listeners = [];
   }

   return {
      publish: publishEvent,
      add: addListener,
      remove: removeListener,
      reset: reset
   };
}

mom = (function () {
   'use strict';

   return newInstance();

   ///////////////////////////////////////////////////////////////////////////////////////////

   function newInstance() {
      var settings = settingsCreator(),
          parts = partsCreator(settings),
          eventBus = eventBusCreator(),
          loadedModules = loadedModulesContainerCreator(settings),
          modules = modulesCreator(parts, eventBus, loadedModules, settings),
          partBuilder = partBuilderCreator(parts, settings),
          moduleBuilder = moduleBuilderCreator(modules),
          domEventListener = domEventListenerCreator(settings, modules, parts),
          moduleLoader = moduleLoaderCreator(modules, parts, domEventListener, settings);

      partBuilder('event-bus')
         .returns(eventBus);

      return merge({
        createPart: partBuilder,
        createModule: moduleBuilder,
        initModulePage: initModulePageInterceptor,
        newInstance: newInstance,
        dispose: dispose,
        getPart: parts.provisionPart,
        getPartDescriptor: parts.getPartDescriptor,
        getModuleDescriptor: modules.getModuleDescriptor
      }, constants);

      ////////////////////////////////////////////////////////////////////////////////////////

      function initModulePageInterceptor(newSettings) {
         if (newSettings !== undefined) {
            settings.mergeWith(newSettings);
         }

         moduleLoader.initModulePage();
      }

      function dispose() {
         if (domEventListener !== undefined) {
            domEventListener.unregisterToEvents();
         }

         eventBus.reset();
      }
   }
})();

/* jshint ignore:start */ 
}(window, document));
/* jshint ignore:end */
