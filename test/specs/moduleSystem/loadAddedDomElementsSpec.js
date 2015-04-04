describe('Module system when dom node added', function() {

   var $parentDiv;

   var spyModule;

   var firstSpyModule;
   var secondSpyModule;

   var firstSpyModuleObject;
   var secondSpyModuleObject;

   var eventBus;

   beforeEach(function() {

      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/simpleModuleDiv.html');
      $parentDiv = $('#test-div');

      firstSpyModuleObject = jasmine.createSpyObj('spyModuleObj1', ['onEvent']);
      secondSpyModuleObject = jasmine.createSpyObj('spyModuleObj2', ['onEvent']);

      spyModule = jasmine.createSpy('spyModule');
      firstSpyModule = jasmine.createSpy('spyModule1').and.callFake(function() {
         return firstSpyModuleObject;
      });

      secondSpyModule = jasmine.createSpy('spyModule2').and.callFake(function() {
         return secondSpyModuleObject;
      });

      moduleSystem.createModule('test-module').creator(spyModule);
      moduleSystem.createModule('test-module1').creator(firstSpyModule);
      moduleSystem.createModule('test-module2').creator(secondSpyModule);

      moduleSystem.initModulePage();

      eventBus = moduleSystem.getPart('event-bus');
   });

   afterEach(function() {
      moduleSystem.dispose();
      eventBus.reset();
   });

   describe('on adding a dom node with one module', function() {

      const ADDED_DIV_ID = 'test-addedDiv';

      beforeEach(function() {

         var elementToAddAsTest = '<div id="' + ADDED_DIV_ID + '" modules="test-module1"></div>';

         $(elementToAddAsTest).
            appendTo($parentDiv);
      });

      it('should call the existing module creator function once (on page init)', function() {

         expect(spyModule.calls.count()).toBe(1);
      });

      it('should call the added module creator function', function() {

         expect(firstSpyModule.calls.count()).toBe(1);
      });

      it('should pass the moduleObject to added moduleCreator', function() {

         expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:ADDED_DIV_ID}));
      });

      describe('when event has been published', function() {

         var publishedEvent;

         beforeEach(function() {

            publishedEvent = {
               name : 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should call event listener function on added module once', function() {

            expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should call event listener function on added module with expected event', function() {

            expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });
      });
   });

   describe('on adding a dom node with a child module', function() {

      const ADDED_DIV_ID = 'test-addedDiv';

      beforeEach(function() {

         var elementToAddAsTest = '<div><div id="' + ADDED_DIV_ID + '" modules="test-module1"></div></div>';

         $(elementToAddAsTest).
            appendTo($parentDiv);
      });

      it('should call the module creator function', function() {

         expect(firstSpyModule.calls.count()).toBe(1);
      });

      it('should pass the created moduleObject to moduleCreator', function() {

         expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:ADDED_DIV_ID}));
      });

      describe('when event has been published', function() {

         var publishedEvent;

         beforeEach(function() {

            publishedEvent = {
               name : 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should call event listener function on added module once', function() {

            expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should call event listener function on added module with expected event', function() {

            expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });
      });
   });

   describe('on adding a dom node with two child modules', function() {

      const FIRST_ADDED_DIV_ID = 'test-addedDiv';
      const SECOND_ADDED_DIV_ID = 'test-addedDiv';

      beforeEach(function() {

         var elementToAddAsTest = '<div>' +
            '<div id="' + FIRST_ADDED_DIV_ID + '" modules="test-module1"></div>' +
            '<div id="' + SECOND_ADDED_DIV_ID + '" modules="test-module1"></div>' +
            '</div>';

         $(elementToAddAsTest).
            appendTo($parentDiv);
      });

      it('should call the module creator function', function() {

         expect(firstSpyModule.calls.count()).toBe(2);
      });

      it('should pass the moduleObject to first moduleCreator', function() {

         expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
      });

      it('should pass the moduleObject to second moduleCreator', function() {

         expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:SECOND_ADDED_DIV_ID}));
      });

      describe('when event has been published', function() {

         var publishedEvent;

         beforeEach(function() {

            publishedEvent = {
               name : 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should call event listener function on first added module once', function() {

            expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should call event listener function on first added module with expected event', function() {

            expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });
      });
   });

   describe('on adding a dom node with two different child modules', function() {

      const FIRST_ADDED_DIV_ID = 'test-addedDiv';
      const SECOND_ADDED_DIV_ID = 'test-addedDiv';

      beforeEach(function() {

         var elementToAddAsTest = '<div>' +
            '<div id="' + FIRST_ADDED_DIV_ID + '" modules="test-module1"></div>' +
            '<div id="' + SECOND_ADDED_DIV_ID + '" modules="test-module2"></div>' +
            '</div>';

         $(elementToAddAsTest).
            appendTo($parentDiv);
      });

      it('should call the module creator function', function() {

         expect(firstSpyModule.calls.count()).toBe(1);
         expect(secondSpyModule.calls.count()).toBe(1);
      });

      it('should pass the moduleObject to first moduleCreator', function() {

         expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
      });

      it('should pass the moduleObject to second moduleCreator', function() {

         expect(secondSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:SECOND_ADDED_DIV_ID}));
      });

      describe('when event has been published', function() {

         var publishedEvent;

         beforeEach(function() {

            publishedEvent = {
               name : 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should call event listener function on first added module once', function() {

            expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should call event listener function on first added module with expected event', function() {

            expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });

         it('should call event listener function on second added module once', function() {

            expect(secondSpyModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should call event listener function on second added module with expected event', function() {

            expect(secondSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });
      });
   });

   describe('on adding a dom node with two different child modules', function() {

      const FIRST_ADDED_DIV_ID = 'test-addedDiv';

      beforeEach(function() {

         var elementToAddAsTest = '<div>' +
            '<div id="' + FIRST_ADDED_DIV_ID + '" modules="test-module1,test-module2"></div>' +
            '</div>';

         $(elementToAddAsTest).
            appendTo($parentDiv);
      });

      it('should call the module creator function', function() {

         expect(firstSpyModule.calls.count()).toBe(1);
         expect(secondSpyModule.calls.count()).toBe(1);
      });

      it('should pass the moduleObject to first moduleCreator', function() {

         expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
      });

      it('should pass the moduleObject to second moduleCreator', function() {

         expect(secondSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
      });

      describe('when event has been published', function() {

         var publishedEvent;

         beforeEach(function() {

            publishedEvent = {
               name : 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should call event listener function on first added module once', function() {

            expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should call event listener function on first added module with expected event', function() {

            expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });

         it('should call event listener function on second added module once', function() {

            expect(secondSpyModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should call event listener function on second added module with expected event', function() {

            expect(secondSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });
      });
   });
});
