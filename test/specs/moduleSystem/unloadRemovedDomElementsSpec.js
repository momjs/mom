describe('Module system when dom element removed', function() {

   var $parentDiv;

   var spyModule;

   var firstSpyModule;
   var secondSpyModule;
   var thirdSpyModule;

   var firstSpyModuleObject;
   var secondSpyModuleObject;
   var thirdSpyModuleObject;

   var eventBus;

   beforeEach(function() {

      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/nestedModules.html');
      $parentDiv = $('#test-div');

      firstSpyModuleObject = jasmine.createSpyObj('spyModuleObj1', ['onEvent']);
      secondSpyModuleObject = jasmine.createSpyObj('spyModuleObj2', ['onEvent']);
      thirdSpyModuleObject = jasmine.createSpyObj('spyModuleObj3', ['onEvent']);

      spyModule = jasmine.createSpy('spyModule');
      firstSpyModule = jasmine.createSpy('spyModule1').and.callFake(function() {
         return firstSpyModuleObject;
      });

      secondSpyModule = jasmine.createSpy('spyModule2').and.callFake(function() {
         return secondSpyModuleObject;
      });

      thirdSpyModule = jasmine.createSpy('spyModule3').and.callFake(function() {
         return thirdSpyModuleObject;
      });

      moduleSystem.createModule('test-module').creator(spyModule);
      moduleSystem.createModule('test-module1').creator(firstSpyModule);
      moduleSystem.createModule('test-module2').creator(secondSpyModule);
      moduleSystem.createModule('test-module3').creator(thirdSpyModule);

      var settings = {
         domMutationSupport: true
      };

      moduleSystem.initModulePage(settings);

      eventBus = moduleSystem.getPart('event-bus');
   });

   afterEach(function() {
      moduleSystem.dispose();
      eventBus.reset();
   });

   describe('when removing child module dom element', function() {

      beforeEach(function() {

         $('#test-div2').remove();
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

         it('should NOT call event listener function on second added module', function() {

            expect(secondSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on third added module', function() {

            expect(thirdSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });
      });
   });

   describe('when removing child module dom element', function() {

      beforeEach(function() {

         $('#test-div1').remove();
      });

      describe('when event has been published', function() {

         var publishedEvent;

         beforeEach(function() {

            publishedEvent = {
               name : 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should NOT call event listener function on first added module', function() {

            expect(firstSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on second added module', function() {

            expect(secondSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on third added module', function() {

            expect(thirdSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });
      });
   });

   describe('when removing parent div (without module)', function() {

      beforeEach(function() {

         $('#test-parentDiv').remove();
      });

      describe('when event has been published', function() {

         var publishedEvent;

         beforeEach(function() {

            publishedEvent = {
               name : 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should NOT call event listener function on first added module', function() {

            expect(firstSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on second added module', function() {

            expect(secondSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on third added module', function() {

            expect(thirdSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });
      });
   });
});
