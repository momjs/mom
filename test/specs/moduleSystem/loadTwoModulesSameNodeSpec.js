describe('Module system when loading two modules on same node', function() {

   var spyModule1;
   var spyModule2;

   beforeEach(function() {
      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/twoModulesSameNode.html');

      spyModule1 = jasmine.createSpy('creator');
      spyModule2 = jasmine.createSpy('creator');

      moduleSystem.createModule('test-module1').creator(spyModule1);
      moduleSystem.createModule('test-module2').creator(spyModule2);
   });

   it('should load a comma separated list of Modules found in dom', function () {

      moduleSystem.initModulePage();

      expect(spyModule1).toHaveBeenCalled();
      expect(spyModule1.calls.argsFor(0)[0]).toBe(document.getElementById('test-module'));

      expect(spyModule2).toHaveBeenCalled();
      expect(spyModule2.calls.argsFor(0)[0]).toBe(document.getElementById('test-module'));
   });
});