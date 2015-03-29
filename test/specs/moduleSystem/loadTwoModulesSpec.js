describe('Module system loads two modules', function() {

   var spyModule1;
   var spyModule2;

   beforeEach(function() {
      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/twoModules.html');

      spyModule1 = jasmine.createSpy('creator');
      spyModule2 = jasmine.createSpy('creator');

      moduleSystem.createModule('test-module1').creator(spyModule1);
      moduleSystem.createModule('test-module2').creator(spyModule2);
   });

   it('should load multiple modules', function () {

      moduleSystem.initModulePage();

      expect(spyModule1).toHaveBeenCalled();
      expect(spyModule1.calls.argsFor(0)[0]).toBe(document.getElementById('test-module1'));

      expect(spyModule2).toHaveBeenCalled();
      expect(spyModule2.calls.argsFor(0)[0]).toBe(document.getElementById('test-module2'));
   });

   it('should have configuratble rootNode', function () {

      moduleSystem.initModulePage({
         rootNode: document.getElementById('test-module1-wrapper')
      });

      expect(spyModule1).toHaveBeenCalled();
      expect(spyModule1.calls.argsFor(0)[0]).toBe(document.getElementById('test-module1'));

      expect(spyModule2).not.toHaveBeenCalled();
   });
});
