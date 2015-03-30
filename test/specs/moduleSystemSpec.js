describe('Module System', function () {
   'use strict';

   afterEach(function () {
      moduleSystem = moduleSystem.newInstance();
   });

   it('should not load a Module if not found in dom', function () {
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('test-module').creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).not.toHaveBeenCalled();
   });
});
