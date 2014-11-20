describe('EventBus', function() {

    var eventbus;
    var testListener;
    var event;

    beforeEach(function() {

        eventbus = moduleSystem.getPart('eventBus');

        testListener = {
            onTestChanged : jasmine.createSpy('onTestChanged'),
            onEvent : jasmine.createSpy('onEvent')
        };

        event = {
            name : 'TestChanged',
            testProperty : 'testValue'
        };
    });

    afterEach(function() {
        eventbus.reset();
    });

    describe('when one listener is registered', function() {

        beforeEach(function() {

            eventbus.add(testListener);
        });

        it('should call onEventName from registered Modules, when a Event is published', function() {

            eventbus.publish(event);

            expect(testListener.onTestChanged).toHaveBeenCalledWith(jasmine.objectContaining({
                testProperty: 'testValue'
            }));
        });

        it('should throw if a module with the same name is allready registered', function() {

            expect(function() {
                eventbus.add(testListener);
            }).toThrow();
        });

        it('should send event without name to onEvent only', function() {

            eventbus.publish(event);

            expect(testListener.onEvent).toHaveBeenCalledWith(event);
        });

        describe('when second listener is registered', function() {

            var secondTestListener;

            beforeEach(function() {

                secondTestListener = {
                    onTestChanged: jasmine.createSpy('onTestChanged')
                };

                eventbus.add(secondTestListener, true);
            });

            it('should call every registered listener', function() {

                eventbus.publish(event);

                expect(testListener.onTestChanged).toHaveBeenCalledWith(jasmine.objectContaining({
                    testProperty: 'testValue'
                }));
                expect(secondTestListener.onTestChanged).toHaveBeenCalledWith(jasmine.objectContaining({
                    testProperty: 'testValue'
                }));
            });
        });
    });
});
