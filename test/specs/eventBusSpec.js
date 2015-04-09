describe('EventBus', function () {

   var eventbus;
   var testListener;
   var event;

   beforeEach(function () {

      eventbus = moduleSystem.getPart('event-bus');

      testListener = {
         onTestChanged: jasmine.createSpy('onTestChanged'),
         onEvent: jasmine.createSpy('onEvent')
      };

      event = {
         name: 'TestChanged',
         testProperty: 'testValue'
      };
   });

   afterEach(function () {
      eventbus.reset();
   });

   describe('when one listener is registered', function () {

      beforeEach(function () {

         eventbus.add(testListener);
      });

      it('should call onEventName from registered Modules, when a Event is published', function () {

         eventbus.publish(event);

         expect(testListener.onTestChanged).toHaveBeenCalledWith(jasmine.objectContaining({
            testProperty: 'testValue'
         }));
      });

      it('should call callback function with listener object as thisArg', function () {

         var thisArg;
         testListener.onTestChanged.and.callFake(function () {
            thisArg = this;
         });

         eventbus.publish(event);

         expect(thisArg).toBe(testListener);
      });

      it('should throw if a module with the same name is already registered', function () {

         expect(function () {
            eventbus.add(testListener);
         }).toThrow();
      });

      it('should send event every to onEvent', function () {

         eventbus.publish(event);

         expect(testListener.onEvent).toHaveBeenCalledWith(event);
      });

      it('should send event without name to onEvent', function () {

         var eventWithoutName = {
            testProperty: 'testValue'
         };

         eventbus.publish(eventWithoutName);

         expect(testListener.onEvent).toHaveBeenCalledWith(eventWithoutName);
      });

      it('should do nothing when published event is undefined', function () {

         expect(function () {
            eventbus.publish();
         }).toThrowError('Published event cannot be undefined');
      });

      describe('when second listener is registered', function () {

         var secondTestListener;

         beforeEach(function () {

            secondTestListener = {
               onTestChanged: jasmine.createSpy('onTestChanged')
            };

            eventbus.add(secondTestListener, true);
         });

         it('should call every registered listener', function () {

            eventbus.publish(event);

            expect(testListener.onTestChanged).toHaveBeenCalledWith(jasmine.objectContaining({
               testProperty: 'testValue'
            }));
            expect(secondTestListener.onTestChanged).toHaveBeenCalledWith(jasmine.objectContaining({
               testProperty: 'testValue'
               git
            }));

         });
      });
   });
});