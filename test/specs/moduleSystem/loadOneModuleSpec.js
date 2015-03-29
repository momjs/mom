describe('Module system when loading single node page', function() {

   var spyModule;

   beforeEach(function() {
      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/oneModule.html');

      spyModule = jasmine.createSpy('creator');
   });

   it('should provide Modules with static dependencies', function () {
      var staticDependency = 'test Static';

      moduleSystem.createPart('static-dependency').returns(staticDependency);
      moduleSystem.createModule('test-module').dependencies(['static-dependency']).creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), staticDependency);
   });

   describe('when loading simple module', function() {

      beforeEach(function() {

         moduleSystem.createModule('test-module').creator(spyModule);
      });

      it('should load any Module found in dom', function () {

         moduleSystem.initModulePage();

         expect(spyModule).toHaveBeenCalled();
         expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-module'));
      });

      it('should load module with configured selector and attribute', function () {

         moduleSystem.initModulePage({
            selector: '.js-module',
            attribute: 'data-modules'
         });

         expect(spyModule).toHaveBeenCalled();
         expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-selectorAndAttributeModule'));
      });

      it('should load module with configured attribute', function () {

         moduleSystem.initModulePage({
            attribute: 'data-mods'
         });

         expect(spyModule).toHaveBeenCalled();
         expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-attributeModule'));
      });
   });

   it('should provide a settings object to the module if specified', function () {

      var settings = {
         testSetting: 'test'
      };

      var spyModule = jasmine.createSpy('creator').and.returnValue({});
      moduleSystem.createModule('test-module')
         .settings(settings)
         .creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), settings);

   });
});
