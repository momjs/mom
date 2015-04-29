describe('Module system', function() {

   var WITHOUT_MODULE_ELEMENT_ID = 'test-without-module';
   var WITHOUT_MODULE_ELEMENT_ID_SELECTOR = '#' + WITHOUT_MODULE_ELEMENT_ID;

   var WITH_ONE_MODULE_ELEMENT_ID = 'test-with-one-module';
   var WITH_ONE_MODULE_ELEMENT_ID_SELECTOR = '#' + WITH_ONE_MODULE_ELEMENT_ID;

   var WITH_TWO_MODULES_ELEMENT_ID = 'test-with-two-modules';
   var WITH_TWO_MODULES_ELEMENT_ID_SELECTOR = '#' + WITH_TWO_MODULES_ELEMENT_ID;

   var $withoutModuleElement;
   var $withOneModuleElement;
   var $withTwoModulesElement;

   var firstExistingModuleCreator;
   var secondExistingModuleCreator;
   var thirdExistingModuleCreator;

   var firstExistingModuleObject;
   var secondExistingModuleObject;
   var thirdExistingModuleObject;

   var firstAddedModuleCreator;
   var secondAddedModuleCreator;

   var firstAddedModuleObject;
   var secondAddedModuleObject;

   var eventBus;

   var DEFAULT_CUSTOM_ID = 'mom-id';

   var WAIT_TIME_FOR_MUTATION_EVENT = 0;
   var MAX_WAIT_TIME = 1000;

   beforeEach(function() {

      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/replaceNodesFixture.html');
      $withoutModuleElement = $(WITHOUT_MODULE_ELEMENT_ID_SELECTOR);
      $withOneModuleElement = $(WITH_ONE_MODULE_ELEMENT_ID_SELECTOR);
      $withTwoModulesElement = $(WITH_TWO_MODULES_ELEMENT_ID_SELECTOR);

      firstExistingModuleObject = jasmine.createSpyObj('first_existing_module_spy_object', ['postConstruct', 'preDestruct', 'onEvent']);
      secondExistingModuleObject = jasmine.createSpyObj('second_existing_module_spy_object', ['postConstruct', 'preDestruct', 'onEvent']);
      thirdExistingModuleObject = jasmine.createSpyObj('third_existing_module_spy_object', ['postConstruct', 'preDestruct', 'onEvent']);

      firstAddedModuleObject = jasmine.createSpyObj('first_added_module_spy_object', ['postConstruct', 'onEvent']);
      secondAddedModuleObject = jasmine.createSpyObj('second_added_module_spy_object', ['postConstruct', 'onEvent']);

      firstExistingModuleCreator = jasmine.createSpy('first_existing_module_spy_creator')
         .and.returnValue(firstExistingModuleObject);
      secondExistingModuleCreator = jasmine.createSpy('second_existing_module_spy_creator')
         .and.returnValue(secondExistingModuleObject);
      thirdExistingModuleCreator = jasmine.createSpy('third_existing_module_spy_creator')
         .and.returnValue(thirdExistingModuleObject);

      firstAddedModuleCreator = jasmine.createSpy('first_added_module_spy_creator')
         .and.returnValue(firstAddedModuleObject);
      secondAddedModuleCreator = jasmine.createSpy('second_added_module_spy_creator')
         .and.returnValue(secondAddedModuleObject);

      moduleSystem.createModule('test-module-added1').creator(firstAddedModuleCreator);
      moduleSystem.createModule('test-module-added2').creator(secondAddedModuleCreator);
      moduleSystem.createModule('test-module-existing1').creator(firstExistingModuleCreator);
      moduleSystem.createModule('test-module-existing2').creator(secondExistingModuleCreator);
      moduleSystem.createModule('test-module-existing3').creator(thirdExistingModuleCreator);

   });

   afterEach(function() {
      moduleSystem.dispose();
   });

   describe('when dom mutation support is enabled', function() {

      beforeEach(function () {
         var settings = {
            domMutationSupport: true
         };

         moduleSystem.initModulePage(settings);

         eventBus = moduleSystem.getPart('event-bus');
      });

      describe('on replacing a non-module-node with a module node', function () {

         var ADDED_DIV_ID = 'test-added-div1';
         var ADDED_DIV_ID_SELECTOR = '#' + ADDED_DIV_ID;

         beforeEach(function (done) {

            var elementToAddAsHtml = '<div id="' + ADDED_DIV_ID + '" modules="test-module-added1"></div>';

            $($withoutModuleElement).
               replaceWith(elementToAddAsHtml);

            setTimeout(function () {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call added module creator once', function() {

            expect(firstAddedModuleCreator).toHaveBeenCalled();
            expect(firstAddedModuleCreator.calls.count()).toEqual(1);
         });

         it('should pass the moduleObject to added moduleCreator', function() {

            var domElementParameter = firstAddedModuleCreator.calls.argsFor(0)[0];

            expect(domElementParameter).toBeInDOM();
            expect(domElementParameter).toHaveAttr('modules', 'test-module-added1');
            expect(domElementParameter).toHaveId(ADDED_DIV_ID);
            expect(domElementParameter.tagName).toEqual('DIV');
         });

         it('should call postConstruct on module', function() {

            expect(firstAddedModuleObject.postConstruct).toHaveBeenCalled();
            expect(firstAddedModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should set the joj-id attribute to the dom element', function() {

            expect(ADDED_DIV_ID_SELECTOR).toHaveAttr(DEFAULT_CUSTOM_ID);
         });

         describe('when event has been published', function () {

            var publishedEvent;

            beforeEach(function () {

               publishedEvent = {
                  name: 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });


            it('should call event listener function on added module once', function() {

               expect(firstAddedModuleObject.onEvent).toHaveBeenCalled();
               expect(firstAddedModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on added module with expected event', function() {

               expect(firstAddedModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });
         });
      });

      describe('on replacing a module-node with a non-module node', function() {

         var ADDED_DIV_ID = 'test-added-div1';
         var ADDED_DIV_ID_SELECTOR = '#' + ADDED_DIV_ID;

         beforeEach(function (done) {

            var elementToAddAsHtml = '<div id="' + ADDED_DIV_ID + '"></div>';

            $($withOneModuleElement).
               replaceWith(elementToAddAsHtml);

            setTimeout(function () {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call added module creator once', function() {

            expect(firstAddedModuleCreator).not.toHaveBeenCalled();
         });

         it('should call postConstruct on added module', function() {

            expect(firstAddedModuleObject.postConstruct).not.toHaveBeenCalled();
         });

         it('should set the joj-id attribute to added dom element', function() {

            expect(ADDED_DIV_ID_SELECTOR).not.toHaveAttr(DEFAULT_CUSTOM_ID);
         });

         it('should call preDestruct on replaced module', function() {

            expect(firstExistingModuleObject.preDestruct).toHaveBeenCalled();
            expect(firstExistingModuleObject.preDestruct.calls.count()).toBe(1);
         });

         describe('when event has been published', function () {

            var publishedEvent;

            beforeEach(function () {

               publishedEvent = {
                  name: 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should NOT call event listener function on added module once', function() {

               expect(firstAddedModuleObject.onEvent).not.toHaveBeenCalled();
            });

            it('should NOT call event listener function on added module once', function() {

               expect(firstExistingModuleObject.onEvent).not.toHaveBeenCalled();
            });
         });
      });

      describe('on replacing a module-node with a module node', function() {

         var ADDED_DIV_ID = 'test-added-div1';
         var ADDED_DIV_ID_SELECTOR = '#' + ADDED_DIV_ID;

         beforeEach(function (done) {

            var elementToAddAsHtml = '<div id="' + ADDED_DIV_ID + '" modules="test-module-added1"></div>';

            $($withOneModuleElement).
               replaceWith(elementToAddAsHtml);

            setTimeout(function () {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call added module creator once', function() {

            expect(firstAddedModuleCreator).toHaveBeenCalled();
            expect(firstAddedModuleCreator.calls.count()).toEqual(1);
         });

         it('should pass the moduleObject to added moduleCreator', function() {

            var domElementParameter = firstAddedModuleCreator.calls.argsFor(0)[0];

            expect(domElementParameter).toBeInDOM();
            expect(domElementParameter).toHaveAttr('modules', 'test-module-added1');
            expect(domElementParameter).toHaveId(ADDED_DIV_ID);
            expect(domElementParameter.tagName).toEqual('DIV');
         });

         it('should call postConstruct on added module', function() {

            expect(firstAddedModuleObject.postConstruct).toHaveBeenCalled();
            expect(firstAddedModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should set the joj-id attribute to added dom element', function() {

            expect(ADDED_DIV_ID_SELECTOR).toHaveAttr(DEFAULT_CUSTOM_ID);
         });

         it('should call preDestruct on replaced module', function() {

            expect(firstExistingModuleObject.preDestruct).toHaveBeenCalled();
            expect(firstExistingModuleObject.preDestruct.calls.count()).toBe(1);
         });

         describe('when event has been published', function () {

            var publishedEvent;

            beforeEach(function () {

               publishedEvent = {
                  name: 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on added module once', function() {

               expect(firstAddedModuleObject.onEvent).toHaveBeenCalled();
               expect(firstAddedModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on added module with expected event', function() {

               expect(firstAddedModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });

            it('should NOT call event listener function on added module once', function() {

               expect(firstExistingModuleObject.onEvent).not.toHaveBeenCalled();
            });
         });
      });

      describe('on replacing a two-modules-node with a module node', function() {

         var ADDED_DIV_ID = 'test-added-div1';
         var ADDED_DIV_ID_SELECTOR = '#' + ADDED_DIV_ID;

         beforeEach(function (done) {

            var elementToAddAsHtml = '<div id="' + ADDED_DIV_ID + '" modules="test-module-added1"></div>';

            $($withTwoModulesElement).
               replaceWith(elementToAddAsHtml);

            setTimeout(function () {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call added module creator once', function() {

            expect(firstAddedModuleCreator).toHaveBeenCalled();
            expect(firstAddedModuleCreator.calls.count()).toEqual(1);
         });

         it('should pass the moduleObject to added moduleCreator', function() {

            var domElementParameter = firstAddedModuleCreator.calls.argsFor(0)[0];

            expect(domElementParameter).toBeInDOM();
            expect(domElementParameter).toHaveAttr('modules', 'test-module-added1');
            expect(domElementParameter).toHaveId(ADDED_DIV_ID);
            expect(domElementParameter.tagName).toEqual('DIV');
         });

         it('should call postConstruct on added module', function() {

            expect(firstAddedModuleObject.postConstruct).toHaveBeenCalled();
            expect(firstAddedModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should set the joj-id attribute to added dom element', function() {

            expect(ADDED_DIV_ID_SELECTOR).toHaveAttr(DEFAULT_CUSTOM_ID);
         });

         it('should call preDestruct on second replaced module', function() {

            expect(secondExistingModuleObject.preDestruct).toHaveBeenCalled();
            expect(secondExistingModuleObject.preDestruct.calls.count()).toBe(1);
         });

         it('should call preDestruct on third replaced module', function() {

            expect(thirdExistingModuleObject.preDestruct).toHaveBeenCalled();
            expect(thirdExistingModuleObject.preDestruct.calls.count()).toBe(1);
         });

         describe('when event has been published', function () {

            var publishedEvent;

            beforeEach(function () {

               publishedEvent = {
                  name: 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on added module once', function() {

               expect(firstAddedModuleObject.onEvent).toHaveBeenCalled();
               expect(firstAddedModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on added module with expected event', function() {

               expect(firstAddedModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });

            it('should NOT call event listener function on third existing (removed) module', function() {

               expect(secondExistingModuleObject.onEvent).not.toHaveBeenCalled();
            });

            it('should NOT call event listener function on third existing (removed) module', function() {

               expect(thirdExistingModuleObject.onEvent).not.toHaveBeenCalled();
            });
         });
      });

      describe('on replacing a two-modules-node with a two-modules node', function() {

         var ADDED_DIV_ID = 'test-added-div1';
         var ADDED_DIV_ID_SELECTOR = '#' + ADDED_DIV_ID;

         beforeEach(function (done) {

            var elementToAddAsHtml = '<div id="' + ADDED_DIV_ID + '" modules="test-module-added1,test-module-added2"></div>';

            $($withTwoModulesElement).
               replaceWith(elementToAddAsHtml);

            setTimeout(function () {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call first added module creator once', function() {

            expect(firstAddedModuleCreator).toHaveBeenCalled();
            expect(firstAddedModuleCreator.calls.count()).toEqual(1);
         });

         it('should call second added module creator once', function() {

            expect(secondAddedModuleCreator).toHaveBeenCalled();
            expect(secondAddedModuleCreator.calls.count()).toEqual(1);
         });

         it('should pass the moduleObject to added moduleCreator', function() {

            var domElementParameter = firstAddedModuleCreator.calls.argsFor(0)[0];

            expect(domElementParameter).toBeInDOM();
            expect(domElementParameter).toHaveAttr('modules', 'test-module-added1,test-module-added2');
            expect(domElementParameter).toHaveId(ADDED_DIV_ID);
            expect(domElementParameter.tagName).toEqual('DIV');
         });

         it('should pass the moduleObject to second added moduleCreator', function() {

            var domElementParameter = secondAddedModuleCreator.calls.argsFor(0)[0];

            expect(domElementParameter).toBeInDOM();
            expect(domElementParameter).toHaveAttr('modules', 'test-module-added1,test-module-added2');
            expect(domElementParameter).toHaveId(ADDED_DIV_ID);
            expect(domElementParameter.tagName).toEqual('DIV');
         });

         it('should call postConstruct on first added module', function() {

            expect(firstAddedModuleObject.postConstruct).toHaveBeenCalled();
            expect(firstAddedModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should call postConstruct on second added module', function() {

            expect(secondAddedModuleObject.postConstruct).toHaveBeenCalled();
            expect(secondAddedModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should set the joj-id attribute to added dom element', function() {

            expect(ADDED_DIV_ID_SELECTOR).toHaveAttr(DEFAULT_CUSTOM_ID);
         });

         it('should call preDestruct on second replaced module', function() {

            expect(secondExistingModuleObject.preDestruct).toHaveBeenCalled();
            expect(secondExistingModuleObject.preDestruct.calls.count()).toBe(1);
         });

         it('should call preDestruct on third replaced module', function() {

            expect(thirdExistingModuleObject.preDestruct).toHaveBeenCalled();
            expect(thirdExistingModuleObject.preDestruct.calls.count()).toBe(1);
         });

         describe('when event has been published', function () {

            var publishedEvent;

            beforeEach(function () {

               publishedEvent = {
                  name: 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on first added module once', function() {

               expect(firstAddedModuleObject.onEvent).toHaveBeenCalled();
               expect(firstAddedModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on second added module once', function() {

               expect(secondAddedModuleObject.onEvent).toHaveBeenCalled();
               expect(secondAddedModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on first added module with expected event', function() {

               expect(firstAddedModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });

            it('should call event listener function on second added module with expected event', function() {

               expect(secondAddedModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });

            it('should NOT call event listener function on third existing (removed) module', function() {

               expect(secondExistingModuleObject.onEvent).not.toHaveBeenCalled();
            });

            it('should NOT call event listener function on third existing (removed) module', function() {

               expect(thirdExistingModuleObject.onEvent).not.toHaveBeenCalled();
            });
         });
      });
   });
});
