describe("EventBus", function () {

   var eventBus = moduleSystem.getPart('eventBus');

   var TestChanged = function (testProperty) {
      this.constructor("TestChanged");

      this.testProperty = testProperty;
   };
   eventBus.Events.register(TestChanged, "TestChanged");

   var testListener;

   beforeEach(function () {
      testListener = {
         name: "testListener",
         onTestChanged: jasmine.createSpy("onTestChanged")
      }

   });

   afterEach(function () {
      eventBus.reset();
   });


   it("should call onEventName from registered Modules, when a Event is published", function () {
      eventBus.add(testListener);

      eventBus.publish(new TestChanged("testValue"));

      expect(testListener.onTestChanged).toHaveBeenCalledWith({
         testProperty: "testValue"
      });
   });

   it("should call every registered listener", function () {
      eventBus.add(testListener);
      var secondTestListener = {
         name: "secondTestListener",
         onTestChanged: jasmine.createSpy("onTestChanged")
      };
      eventBus.add(secondTestListener);

      eventBus.publish(new TestChanged("testValue"));

      expect(testListener.onTestChanged).toHaveBeenCalledWith({
         testProperty: "testValue"
      });
      expect(secondTestListener.onTestChanged).toHaveBeenCalledWith({
         testProperty: "testValue"
      });

   });

   it("should not call onEventName if a module is removed from the EventBus", function () {
      eventBus.add(testListener);
      eventBus.remove(testListener.name);

      eventBus.publish(new TestChanged("testValue"));

      expect(testListener.onTestChanged).not.toHaveBeenCalled();
   });

   it("should throw if a module with the same name is allready registered", function () {
      eventBus.add(testListener);

      expect(function () {
         eventBus.add(testListener);
      }).toThrow();
   });

   it("should not throw if a module with the same name is allready registered and override is on", function () {
      eventBus.add(testListener);

      expect(function () {
         eventBus.add(testListener, true);
      }).not.toThrow();
   });

   it("should override a registered Module if override is on", function () {
      eventBus.add(testListener);
      var secondTestListener = {
         name: testListener.name,
         onTestChanged: jasmine.createSpy("onTestChanged")
      };
      eventBus.add(secondTestListener, true);

      eventBus.publish(new TestChanged("testValue"));

      expect(testListener.onTestChanged).not.toHaveBeenCalledWith();
      expect(secondTestListener.onTestChanged).toHaveBeenCalledWith({
         testProperty: "testValue"
      });

   });


});