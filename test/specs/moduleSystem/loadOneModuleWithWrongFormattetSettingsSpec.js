describe('Module system loads one module with wrong formatted settings', function () {
   var wrongFormattedJSONModule;

   beforeEach(function () {
      loadFixtures('moduleSystem/oneModuleWithWrongFormattedSettings.html');

      wrongFormattedJSONModule = jasmine.createSpy('wrongFormattedJSONModule');
      mom.createModule('test-module1').creator(wrongFormattedJSONModule);

   });

   it('should throw meaningfull error message', function () {
      expect(mom.initModulePage).toThrowError(/Module \[test-module1\] has invalid json in dom. Message: /);
   });
});