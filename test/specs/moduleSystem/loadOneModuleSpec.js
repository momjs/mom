describe('Module system loads one module', function () {

   var spyModule;

   beforeEach(function() {

      loadFixtures('moduleSystem/oneModule.html');

      spyModule = jasmine.createSpy('spyModule');

      moduleSystem = moduleSystem.newInstance();
   });

   afterEach(function() {
      moduleSystem.dispose();
   });

   it('should throw Error if a module is not registered but found in dom', function () {

      expect(moduleSystem.initModulePage).toThrowError('Module [test-module] not created but found in dom');
   });

   it('should provide Modules with static dependencies', function () {
      var staticDependency = 'test Static';

      moduleSystem.createPart('static-dependency').returns(staticDependency);
      moduleSystem.createModule('test-module').dependencies(['static-dependency']).creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), staticDependency);
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

   it('should add every module to the event bus', function () {
      var eventBus = moduleSystem.getPart('event-bus');

      eventBus.add = jasmine.createSpy('add').and.callThrough();

      var publicMethodObject = {
         testProperty: 'test'
      };
      moduleSystem.createModule('test-module').creator(function () {
         return publicMethodObject;
      });


      moduleSystem.initModulePage();


      expect(eventBus.add).toHaveBeenCalledWith({
         testProperty: 'test'
      });
   });

   it('should call postConstruct when provision is finished', function () {
      var spyModuleObject = jasmine.createSpyObj('module object', ['postConstruct']);
      var initWasCalled = false;

      spyModuleObject.postConstruct.and.callFake(function () {
         expect(initWasCalled).toEqual(true);
      });

      var spyModule = jasmine.createSpy('spyModule').and.callFake(function () {
         initWasCalled = true;
         return spyModuleObject;
      });


      moduleSystem.createModule('test-module').creator(spyModule);


      moduleSystem.initModulePage();


      expect(spyModuleObject.postConstruct).toHaveBeenCalled();
   });

   describe('when loading simple module', function () {

      beforeEach(function () {

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

   describe('with dependency from module', function () {

      beforeEach(function () {

         moduleSystem.createModule('test-module').dependencies(['test-part']).creator(spyModule);
      });

      it('should load any needed Part', function () {
         var spyPart = jasmine.createSpy('creator');
         moduleSystem.createPart('test-part').creator(spyPart);

         moduleSystem.initModulePage();

         expect(spyPart).toHaveBeenCalled();
      });

      it('should not load any part which is not needed', function () {
         moduleSystem.createPart('test-part').creator(function () {});
         var spyPart = jasmine.createSpy('creator');
         moduleSystem.createPart('test-part2').creator(spyPart);

         moduleSystem.initModulePage();

         expect(spyPart).not.toHaveBeenCalled();
      });

      it('should add missing parts to the module', function () {
         var publicMethodObject = {
            testProperty: 'test'
         };
         moduleSystem.createPart('test-part').creator(function () {
            return publicMethodObject;
         });

         moduleSystem.initModulePage();


         expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), publicMethodObject);
      });

      it('should call postConstruct when get part is called', function () {
         var spyPartObject = jasmine.createSpyObj('part object', ['postConstruct']);
         var postConstructSpy = spyPartObject.postConstruct;


         moduleSystem.createPart('test-part')
            .creator(function () {
               return spyPartObject;
            });


         moduleSystem.getPart('test-part');


         expect(postConstructSpy).toHaveBeenCalled();
      });
   });
});