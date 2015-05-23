describe('Module system when dom element removed', function () {

   var EXISTING_DIV_ID = 'test-div';
   var EXISTING_DIV_ID_SELECTOR = '#' + EXISTING_DIV_ID;

   var $parentDiv;

   var spyModule;

   var firstSpyModule;
   var secondSpyModule;
   var thirdSpyModule;
   var fourthSpyModule;
   var fifthSpyModule;

   var firstSpyModuleObject;
   var secondSpyModuleObject;
   var thirdSpyModuleObject;
   var fourthSpyModuleObject;
   var fifthSpyModuleObject;

   var eventBus;

   var thrownError;

   var WAIT_TIME_FOR_MUTATION_EVENT = 0;
   var MAX_WAIT_TIME = 1000;

   beforeEach(function () {

      mom = mom.newInstance();

      loadFixtures('moduleSystem/nestedModules.html');
      $parentDiv = $(EXISTING_DIV_ID_SELECTOR);

      thrownError = new Error('Error occurred on preDestruct');

      firstSpyModuleObject = jasmine.createSpyObj('spyModuleObj1', ['onEvent', 'preDestruct']);
      secondSpyModuleObject = jasmine.createSpyObj('spyModuleObj2', ['onEvent', 'preDestruct']);
      thirdSpyModuleObject = jasmine.createSpyObj('spyModuleObj3', ['onEvent', 'preDestruct']);


      spyModule = jasmine.createSpy('spyModule');
      firstSpyModule = jasmine.createSpy('spyModule1').and.callFake(function () {
         return firstSpyModuleObject;
      });

      secondSpyModule = jasmine.createSpy('spyModule2').and.callFake(function () {
         return secondSpyModuleObject;
      });

      thirdSpyModule = jasmine.createSpy('spyModule3').and.callFake(function () {
         return thirdSpyModuleObject;
      });


      mom.createModule('test-module').creator(spyModule);
      mom.createModule('test-module1').creator(firstSpyModule);
      mom.createModule('test-module2').creator(secondSpyModule);
      mom.createModule('test-module3').creator(thirdSpyModule);

      var settings = {
         domMutationSupport: true
      };

      mom.initModulePage(settings);

      eventBus = mom.getPart('event-bus');
   });

   afterEach(function () {
      mom.dispose();
      eventBus.reset();
   });

   describe('when removing child module dom element', function () {

      beforeEach(function (done) {

         $('#test-div2').remove();

         setTimeout(function () {
            done();
         }, WAIT_TIME_FOR_MUTATION_EVENT);
      }, MAX_WAIT_TIME);

      it('should call preDestruct on second module', function () {

         expect(secondSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      it('should call preDestruct on third module', function () {

         expect(thirdSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      describe('when event has been published', function () {

         var publishedEvent;

         beforeEach(function () {

            publishedEvent = {
               name: 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should call event listener function on first added module once', function () {

            expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should call event listener function on first added module with expected event', function () {

            expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });

         it('should NOT call event listener function on second added module', function () {

            expect(secondSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on third added module', function () {

            expect(thirdSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });
      });
   });

   describe('when removing child module dom element', function () {

      beforeEach(function (done) {

         $('#test-div1').remove();

         setTimeout(function () {
            done();
         }, WAIT_TIME_FOR_MUTATION_EVENT);
      }, MAX_WAIT_TIME);

      it('should call preDestruct on first module', function () {

         expect(thirdSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      it('should call preDestruct on second module', function () {

         expect(secondSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      it('should call preDestruct on third module', function () {

         expect(thirdSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      describe('when event has been published', function () {

         var publishedEvent;

         beforeEach(function () {

            publishedEvent = {
               name: 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should NOT call event listener function on first added module', function () {

            expect(firstSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on second added module', function () {

            expect(secondSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on third added module', function () {

            expect(thirdSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });
      });
   });

   describe('when removing parent div (without module)', function () {

      beforeEach(function (done) {

         $('#test-parentDiv').remove();

         setTimeout(function () {
            done();
         }, WAIT_TIME_FOR_MUTATION_EVENT);
      }, MAX_WAIT_TIME);

      it('should call preDestruct on first module', function () {

         expect(firstSpyModuleObject.preDestruct).toHaveBeenCalled();
         expect(firstSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      it('should call preDestruct on second module', function () {

         expect(secondSpyModuleObject.preDestruct).toHaveBeenCalled();
         expect(secondSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      it('should call preDestruct on third module', function () {

         expect(thirdSpyModuleObject.preDestruct).toHaveBeenCalled();
         expect(thirdSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      describe('when event has been published', function () {

         var publishedEvent;

         beforeEach(function () {

            publishedEvent = {
               name: 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should NOT call event listener function on first added module', function () {

            expect(firstSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on second added module', function () {

            expect(secondSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on third added module', function () {

            expect(thirdSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });
      });
   });

  describe('when removing no element node', function() {

      beforeEach(function (done) {

         var textNode = document.createTextNode('test');
         var parent = document.getElementById('test-parentDiv');
         var testDiv1 = document.getElementById('test-div');

         parent.appendChild(textNode);

         parent.removeChild(textNode);
         parent.removeChild(testDiv1);

         setTimeout(function () {
            done();
         }, WAIT_TIME_FOR_MUTATION_EVENT);
      }, MAX_WAIT_TIME);

      it('should call preDestruct on first module', function () {

         expect(thirdSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      it('should call preDestruct on second module', function () {

         expect(secondSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      it('should call preDestruct on third module', function () {

         expect(thirdSpyModuleObject.preDestruct.calls.count()).toBe(1);
      });

      describe('when event has been published', function () {

         var publishedEvent;

         beforeEach(function () {

            publishedEvent = {
               name: 'MyTestEvent'
            };

            eventBus.publish(publishedEvent);
         });

         it('should NOT call event listener function on first added module', function () {

            expect(firstSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on second added module', function () {

            expect(secondSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should NOT call event listener function on third added module', function () {

            expect(thirdSpyModuleObject.onEvent).not.toHaveBeenCalled();
         });
      });
  });
});
