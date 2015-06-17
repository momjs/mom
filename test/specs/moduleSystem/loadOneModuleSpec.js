describe('Module system loads one module', function () {

   var spyModule;

   beforeEach(function() {

      loadFixtures('moduleSystem/oneModule.html');

      spyModule = jasmine.createSpy('spyModule');

      mom = mom.newInstance();
   });

   afterEach(function() {
      mom.dispose();
   });

   it('should throw Error if a module is not registered but found in dom', function () {

      expect(mom.initModulePage).toThrowError('Module [test-module] not created but found in dom');
   });

   it('should provide Modules with static dependencies', function () {
      var staticDependency = 'test Static';

      mom.createPart('static-dependency').returns(staticDependency);
      mom.createModule('test-module').dependencies(['static-dependency']).creator(spyModule);

      mom.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), staticDependency);
   });

   it('should provide a settings object to the module if specified', function () {

      var settings = {
         testSetting: 'test'
      };

      var spyModule = jasmine.createSpy('creator').and.returnValue({});
      mom.createModule('test-module')
         .settings(settings)
         .creator(spyModule);

      mom.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), settings);

   });

   it('should add every module to the event bus', function () {
      var eventBus = mom.getPart('event-bus');

      eventBus.add = jasmine.createSpy('add').and.callThrough();

      var publicMethodObject = {
         testProperty: 'test'
      };
      mom.createModule('test-module').creator(function () {
         return publicMethodObject;
      });


      mom.initModulePage();


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


      mom.createModule('test-module').creator(spyModule);


      mom.initModulePage();


      expect(spyModuleObject.postConstruct).toHaveBeenCalled();
   });

   describe('when loading simple module', function () {

      beforeEach(function () {

         mom.createModule('test-module').creator(spyModule);
      });

      it('should load any Module found in dom', function () {

         mom.initModulePage();

         expect(spyModule).toHaveBeenCalled();
         expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-module'));
      });

      it('should load module with configured selector and attribute', function () {

         mom.initModulePage({
            selector: '.js-module',
            attribute: 'data-modules'
         });

         expect(spyModule).toHaveBeenCalled();
         expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-selectorAndAttributeModule'));
      });

      it('should load module with configured attribute', function () {

         mom.initModulePage({
            attribute: 'data-mods'
         });

         expect(spyModule).toHaveBeenCalled();
         expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-attributeModule'));
      });
   });

   describe('with dependency from module', function () {

      beforeEach(function () {

         mom.createModule('test-module').dependencies(['test-part']).creator(spyModule);
      });

      it('should load any needed Part', function () {
         var spyPart = jasmine.createSpy('creator');
         mom.createPart('test-part').creator(spyPart);

         mom.initModulePage();

         expect(spyPart).toHaveBeenCalled();
      });

      it('should not load any part which is not needed', function () {
         mom.createPart('test-part').creator(function () {});
         var spyPart = jasmine.createSpy('creator');
         mom.createPart('test-part2').creator(spyPart);

         mom.initModulePage();

         expect(spyPart).not.toHaveBeenCalled();
      });

      it('should add missing parts to the module', function () {
         var publicMethodObject = {
            testProperty: 'test'
         };
         mom.createPart('test-part').creator(function () {
            return publicMethodObject;
         });

         mom.initModulePage();


         expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), publicMethodObject);
      });

      it('should call postConstruct when get part is called', function () {
         var spyPartObject = jasmine.createSpyObj('part object', ['postConstruct']);
         var postConstructSpy = spyPartObject.postConstruct;


         mom.createPart('test-part')
            .creator(function () {
               return spyPartObject;
            });


         mom.getPart('test-part');


         expect(postConstructSpy).toHaveBeenCalled();
      });
   });

  describe('when getting descriptor', function() {
    it('should throw an exception when definition is not found', function() {
      expect(function() {
        mom.getModuleDescriptor('test-module');
      }).toThrowError('tried to load test-module module descriptor, but was not registered');
    });

    it('should return a registered creator definition', function() {
      //given
      var settings = {
        test: 'test'
      };
      var dependencies = ['test-dependency'];
      var creator = function() {

      };
      var name = 'test-module';

      mom.createModule(name)
        .dependencies(dependencies)
        .settings(settings)
        .creator(creator);

      //when
      var descriptor = mom.getModuleDescriptor(name);

      //then
      expect(descriptor).toEqual({
        name: name,
        settings: settings,
        dependencies: dependencies,
        creator: creator,
        type: 'creator'
      });
    });
  });
});
