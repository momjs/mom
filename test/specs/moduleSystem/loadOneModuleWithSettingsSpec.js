describe('Module system loads one module with settings', function() {

   var spyModule;

   beforeEach(function() {
      mom = mom.newInstance();

      loadFixtures('moduleSystem/oneModuleWithSettings.html');

      spyModule = jasmine.createSpy('creator').and.returnValue({});
   });

   it('should provide a settings object to the module if settings found in DOM', function () {

      mom.createModule('test-module')
         .creator(spyModule);

      mom.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), {
         testOverrideSetting: 12
      });

   });

   it('should override the specified settings with the settings found in DOM', function () {

      var settings = {
         testOverrideSetting: 'test',
         otherSetting: 'setting'
      };

      mom.createModule('test-module')
         .settings(settings)
         .creator(spyModule);

      mom.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), {
         testOverrideSetting: 12,
         otherSetting: settings.otherSetting
      });
   });
});
