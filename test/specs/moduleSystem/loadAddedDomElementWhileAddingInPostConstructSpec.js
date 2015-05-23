describe('Module system', function() {

   var EXISTING_DIV_ID = 'test-div';
   var EXISTING_DIV_ID_SELECTOR = '#' + EXISTING_DIV_ID;

   var $parentDiv;

   var eventBus;

   var existingModuleCreator;
   var existingModuleObject;

   var addedModuleCreator;
   var notAddedModuleCreator;

   var addedModuleObject;
   var notAddedModuleObject;

   var ADDED_DIV_ID = 'test-addedDiv';
   var NOT_ADDED_DIV_ID = 'test-notAddedDiv';

   var elementToAddAsHtmlInPostConstruct = '<div id="' + ADDED_DIV_ID + '" modules="added-module"></div>';
   var elementToAddAsHtmlInCreator = '<div id="' + NOT_ADDED_DIV_ID + '" modules="not-added-module"></div>';

   var WAIT_TIME_FOR_MUTATION_EVENT = 0;
   var MAX_WAIT_TIME = 1000;

   beforeEach(function () {

      mom = mom.newInstance();

      loadFixtures('moduleSystem/simpleModuleDiv.html');
      $parentDiv = $(EXISTING_DIV_ID_SELECTOR);

      existingModuleObject = {

         postConstruct : jasmine.createSpy('existingModuleObject.postConstruct').and.callFake(function() {
            $parentDiv.append(elementToAddAsHtmlInPostConstruct);
         })
      };
      addedModuleObject = jasmine.createSpyObj('addedModuleObject', ['onEvent', 'postConstruct']);
      notAddedModuleObject = jasmine.createSpyObj('notAddedModuleObject', ['onEvent', 'postConstruct']);

      existingModuleCreator = jasmine.createSpy('existingModuleCreate').and.callFake(function() {

         $parentDiv.append(elementToAddAsHtmlInCreator);

         return existingModuleObject;
      });

      addedModuleCreator = jasmine.createSpy('addedModuleCreator').and.returnValue(addedModuleObject);
      notAddedModuleCreator = jasmine.createSpy('notAddedModuleCreator').and.returnValue(notAddedModuleObject);

      mom.createModule('test-module').creator(existingModuleCreator);
      mom.createModule('added-module').creator(addedModuleCreator);
      mom.createModule('not-added-module').creator(notAddedModuleCreator);
   });

   afterEach(function() {
      mom.dispose();
   });

   describe('when dom mutation support is enabled', function () {

      beforeEach(function(done) {

         var settings = {
            domMutationSupport: true
         };

         mom.initModulePage(settings);

         eventBus = mom.getPart('event-bus');

         setTimeout(function() {
            done();
         }, WAIT_TIME_FOR_MUTATION_EVENT);
      }, MAX_WAIT_TIME);

      it('should call postConstruct of existing module', function() {

         expect(existingModuleObject.postConstruct).toHaveBeenCalled();
         expect(existingModuleObject.postConstruct.calls.count()).toBe(1);
      });

      it('should call added module creator', function() {

         expect(addedModuleCreator).toHaveBeenCalled();
         expect(addedModuleCreator.calls.count()).toBe(1);
      });

      it('should NOT call module creator which dom element has been added in creator', function() {

         expect(notAddedModuleCreator).not.toHaveBeenCalled();
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

            expect(addedModuleObject.onEvent).toHaveBeenCalled();
            expect(addedModuleObject.onEvent.calls.count()).toBe(1);
         });

         it('should NOT call event listener function on not-added module', function() {

            expect(notAddedModuleObject.onEvent).not.toHaveBeenCalled();
         });

         it('should call event listener function on added module with expected event', function() {

            expect(addedModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
         });
      });
   });
});