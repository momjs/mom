describe('Module system', function() {

   var EXISTING_DIV_ID = 'test-div';
   var EXISTING_DIV_ID_SELECTOR = '#' + EXISTING_DIV_ID;

   var $parentDiv;

   var eventBus;

   var existingModuleCreator;
   var existingModuleObject;

   var addedModuleCreator;

   var addedModuleObject;

   var ADDED_DIV_ID = 'test-addedDiv';

   var elementToAddAsHtml = '<div id="' + ADDED_DIV_ID + '" modules="added-module"></div>';

   var WAIT_TIME_FOR_MUTATION_EVENT = 10;
   var MAX_WAIT_TIME = 1000;

   beforeEach(function () {

      mom = mom.newInstance();

      loadFixtures('moduleSystem/simpleModuleDiv.html');
      $parentDiv = $(EXISTING_DIV_ID_SELECTOR);

      existingModuleObject = {

         postConstruct : jasmine.createSpy('existingModuleObject.postConstruct').and.callFake(function() {
            $parentDiv.appendTo(elementToAddAsHtml);
         })
      };
      addedModuleObject = jasmine.createSpyObj('addedModuleObject', ['onEvent', 'postConstruct']);

      existingModuleCreator = jasmine.createSpy('existingModuleCreate').and.returnValue(existingModuleObject);
      addedModuleCreator = jasmine.createSpy('addedModuleCreator').and.callFake(addedModuleCreator);

      mom.createModule('test-module').creator(existingModuleCreator);
      mom.createModule('added-module').creator(addedModuleCreator);
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
   });
});