describe('Module system', function() {

   var $parentDiv;

   var spyModule;

   var firstSpyModule;
   var secondSpyModule;

   var firstSpyModuleObject;
   var firstSpyModuleObject_secondInstance;
   var secondSpyModuleObject;

   var eventBus;

   beforeEach(function() {

      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/simpleModuleDiv.html');
      $parentDiv = $('#test-div');

      spyModule = jasmine.createSpy('spyModule');
      firstSpyModuleObject = jasmine.createSpyObj('spyModuleObj1a', ['onEvent', 'postConstruct']);
      firstSpyModuleObject_secondInstance = jasmine.createSpyObj('spyModuleObj1b', ['onEvent', 'postConstruct']);
      secondSpyModuleObject = jasmine.createSpyObj('spyModuleObj2', ['onEvent', 'postConstruct']);

      var getFirstSpy = (function() {
         var hasBeenCalled = false;

         return function() {
            if(hasBeenCalled === true) {
               return firstSpyModuleObject_secondInstance;
            }
            else {
               hasBeenCalled = true;
               return firstSpyModuleObject;
            }
         }
      })();

      firstSpyModule = jasmine.createSpy('spyModule1').and.callFake(getFirstSpy);

      secondSpyModule = jasmine.createSpy('spyModule2').and.callFake(function() {
         return secondSpyModuleObject;
      });

      moduleSystem.createModule('test-module').creator(spyModule);
      moduleSystem.createModule('test-module1').creator(firstSpyModule);
      moduleSystem.createModule('test-module2').creator(secondSpyModule);

   });

   afterEach(function() {
      moduleSystem.dispose();
   });

   describe('when dom mutation support is enabled', function() {

      beforeEach(function() {
         var settings = {
            domMutationSupport: true
         };

         moduleSystem.initModulePage(settings);

         eventBus = moduleSystem.getPart('event-bus');
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

         it('should call postConstruct on module', function() {

            expect(firstSpyModuleObject.postConstruct.calls.count()).toBe(1);
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

         it('should call postConstruct on module', function() {

            expect(firstSpyModuleObject.postConstruct.calls.count()).toBe(1);
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

         const FIRST_ADDED_DIV_ID = 'test-addedDiv1';
         const SECOND_ADDED_DIV_ID = 'test-addedDiv2';

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

         it('should call postConstruct on module', function() {

            expect(firstSpyModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should call postConstruct on 2nd instance module', function() {

            expect(firstSpyModuleObject_secondInstance.postConstruct.calls.count()).toBe(1);
         });

         describe('when event has been published', function() {

            var publishedEvent;

            beforeEach(function() {

               publishedEvent = {
                  name : 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on first instance of added module 1', function() {

               expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on first instance of added module 1 with expected event', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });

            it('should call event listener function on second instance of added module 1', function() {

               expect(firstSpyModuleObject_secondInstance.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on second instance of added module 1 with expected event', function() {

               expect(firstSpyModuleObject_secondInstance.onEvent).toHaveBeenCalledWith(publishedEvent);
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

         it('should call the first module creator function', function() {

            expect(firstSpyModule.calls.count()).toBe(1);
         });

         it('should call the second module creator function', function() {

            expect(secondSpyModule.calls.count()).toBe(1);
         });

         it('should pass the moduleObject to first moduleCreator', function() {

            expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
         });

         it('should pass the moduleObject to second moduleCreator', function() {

            expect(secondSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:SECOND_ADDED_DIV_ID}));
         });

         it('should call postConstruct on first module', function() {

            expect(firstSpyModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should call postConstruct on second module', function() {

            expect(secondSpyModuleObject.postConstruct.calls.count()).toBe(1);
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

   describe('when dom mutation support is disabled', function() {

      const ADDED_DIV_ID = 'test-addedDiv';

      beforeEach(function() {
         var settings = {
            domMutationSupport: false
         };

         moduleSystem.initModulePage(settings);

         eventBus = moduleSystem.getPart('event-bus');
      });

      describe('when div has been added to dom', function() {

         beforeEach(function() {

            var elementToAddAsTest = '<div id="' + ADDED_DIV_ID + '" modules="test-module1"></div>';

            $(elementToAddAsTest).
               appendTo($parentDiv);
         });

         it('should call the existing module creator function once (on page init)', function() {

            expect(spyModule.calls.count()).toBe(1);
         });

         it('should NOT call the added module creator function', function() {

            expect(firstSpyModule).not.toHaveBeenCalled();
         });
      });
   });
});
