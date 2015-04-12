describe('Module system loads one module with wrong formatted settings', function () {
   var wrongFormattedJSONModule;

   beforeEach(function () {
      loadFixtures('moduleSystem/oneModuleWithWrongFormattedSettings.html');

      wrongFormattedJSONModule = jasmine.createSpy('wrongFormattedJSONModule');
      moduleSystem.createModule('test-module1').creator(wrongFormattedJSONModule);

   });

   it('should throw meaningfull error message', function () {
      expect(moduleSystem.initModulePage).toThrowError(/Module \[test-module1\] has invalid json in dom. Message: /);
   });
});