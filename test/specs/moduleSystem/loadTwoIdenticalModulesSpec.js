describe('Module system loads two identical modules', function() {

   var spyModule1;
   var spyModule2;

   beforeEach(function() {
      mom = mom.newInstance();

      loadFixtures('moduleSystem/twoIdenticalModules.html');

      spyModule1 = jasmine.createSpy('creator');
      spyModule2 = jasmine.createSpy('creator');

      mom.createModule('test-module1').creator(spyModule1);
      mom.createModule('test-module2').creator(spyModule2);
   });

   it('should create a module for every module in dom', function () {
      var spyModule = jasmine.createSpy('creator');
      mom.createModule('test-module').creator(spyModule);

      mom.initModulePage();

      expect(spyModule.calls.count()).toBe(2);
      expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-module1'));
      expect(spyModule.calls.argsFor(1)[0]).toBe(document.getElementById('test-module12'));
   });

   it('should not throw if the same module is found multiple times in dom', function () {

      var spyModule = jasmine.createSpy('creator').and.callFake(function () {
         return {};
      });
      mom.createModule('test-module').creator(spyModule);

      expect(mom.initModulePage).not.toThrow();
   });

   it('should call post construct from multiple times', function () {

      var spyModule1 = jasmine.createSpyObj('spyModule1', ['postConstruct']);
      var spyModule2 = jasmine.createSpyObj('spyModule2', ['postConstruct']);
      var first = true;
      var creator = function () {
         if (first) {
            first = false;
            return spyModule1;
         } else {
            return spyModule2;
         }
      };

      mom.createModule('test-module').creator(creator);

      mom.initModulePage();

      expect(spyModule1.postConstruct).toHaveBeenCalled();
      expect(spyModule2.postConstruct).toHaveBeenCalled();
   });
});
