describe('Module system when dom node added', function() {

   var $parentDiv;

   var spyModule;

   var firstSpyModule;
   var secondSpyModule;

   beforeEach(function() {

      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/simpleModuleDiv.html');
      $parentDiv = $('#test-div');

      spyModule = jasmine.createSpy('spyModule');
      firstSpyModule = jasmine.createSpy('spyModule1');
      secondSpyModule = jasmine.createSpy('spyModule2');

      moduleSystem.createModule('test-module').creator(spyModule);
      moduleSystem.createModule('test-module1').creator(firstSpyModule);
      moduleSystem.createModule('test-module2').creator(secondSpyModule);

      moduleSystem.initModulePage();
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
   });
});
