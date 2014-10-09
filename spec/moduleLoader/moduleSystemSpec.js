describe('The Module Loader', function () {
   'use strict';
   afterEach(function () {
      moduleSystem.reset();
   });

   it('should load any Module found in dom', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalled();
      expect(spyModule.calls.argsFor(0)[0]).toEqual($('#test-testModule'));
   });

   it('should not load a Module if not found in dom', function () {
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).not.toHaveBeenCalled();
   });

   it('should provide a settings object to the module if specified', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var settings = {
         testSetting: 'test'
      };

      var spyModule = jasmine.createSpy('creator').and.returnValue({});
      moduleSystem.createModule('testModule')
         .settings(settings)
         .creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), settings);

   });

   it('should provide a settings object to the module if settings found in DOM', function () {
      loadFixtures('moduleSystem/oneModuleWithSettings.html');

      var spyModule = jasmine.createSpy('creator').and.returnValue({});
      moduleSystem.createModule('testModule')
         .creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), {
         testOverrideSetting: 12
      });

   });

   it('should override the specified settings with the settings found in DOM', function () {
      loadFixtures('moduleSystem/oneModuleWithSettings.html');
      var settings = {
         testOverrideSetting: 'test',
         otherSetting: 'setting'
      };

      var spyModule = jasmine.createSpy('creator').and.returnValue({});
      moduleSystem.createModule('testModule')
         .settings(settings)
         .creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), {
         testOverrideSetting: 12,
         otherSetting: settings.otherSetting
      });

   });

   it('should set the name of a module to its moduleObj', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var moduleObj = {};
      var spyModule = jasmine.createSpy('creator').and.returnValue(moduleObj);
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage();

      expect(moduleObj.name).toBe('testModule0');
   });

   it('should create a module for every module in dom', function () {
      loadFixtures('moduleSystem/twoIdenticalModules.html');
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule.calls.count()).toBe(2);
      expect(spyModule.calls.argsFor(0)[0]).toEqual($('#test-testModule1'));
      expect(spyModule.calls.argsFor(1)[0]).toEqual($('#test-testModule2'));
   });

   it('should set incrementing name of a module to its moduleObj', function () {
      loadFixtures('moduleSystem/twoIdenticalModules.html');
      var moduleObj = {};
      var spyModule = jasmine.createSpy('creator').and.returnValue(moduleObj);
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage();

      expect(moduleObj.name).toBe('testModule1');
   });

   it('should Throw if a Module in the dom is not registered', function () {
      loadFixtures('moduleSystem/oneModule.html');

      expect(moduleSystem.initModulePage).toThrow();
   });


   describe('with parts', function () {
      var spyModule;

      it('should get a part', function () {
         var spyPart = jasmine.createSpy('creator');
         moduleSystem.createPart('testPart').creator(function () {
            return spyPart;
         });

         expect(moduleSystem.getPart('testPart')).toEqual(spyPart);
      });

      it('should provide a settings object to the part if specified', function () {
         var settings = {
            testSetting: 'test'
         };

         var spyPart = jasmine.createSpy('creator').and.returnValue({});
         moduleSystem.createPart('testPart')
            .settings(settings)
            .creator(spyPart);

         moduleSystem.getPart('testPart');

         expect(spyPart).toHaveBeenCalledWith(settings);
      });

      it('should add missing Parts to Parts', function () {
         var testPart = jasmine.createSpy('test part');
         var publicMethodObject = {
            testProperty: 'test'
         };
         moduleSystem.createPart('dependencyPart').creator(function () {
            return publicMethodObject;
         });
         moduleSystem.createPart('testPart').dependencies(['dependencyPart']).creator(testPart);

         moduleSystem.getPart('testPart');


         expect(testPart).toHaveBeenCalledWith(publicMethodObject);
      });

      it('should throw an exception if a part dependencie couldnt be resolved', function () {
         var spyPart = jasmine.createSpy();
         moduleSystem.createPart('testPart').dependencies(['dependencyPart']).creator(spyPart);

         expect(function () {
            moduleSystem.getPart('testPart')
         }).toThrow();
      });


      it('should throw an exception on circular dependencies', function () {
         var spyPart = jasmine.createSpy();
         moduleSystem.createPart('testPart').dependencies(['dependencyPart']).creator(spyPart);
         moduleSystem.createPart('dependencyPart').dependencies(['testPart']).creator(spyPart);

         expect(function () {
            moduleSystem.getPart('testPart')
         }).toThrow();
      });

      describe('with dependencie from module', function () {
         beforeEach(function () {
            loadFixtures('moduleSystem/oneModule.html');
            spyModule = jasmine.createSpy('module');

            moduleSystem.createModule('testModule').dependencies(['testPart']).creator(spyModule);
         });

         it('should load any needed Part', function () {
            var spyPart = jasmine.createSpy('creator');
            moduleSystem.createPart('testPart').creator(spyPart);

            moduleSystem.initModulePage();

            expect(spyPart).toHaveBeenCalled();
         });

         it('should not load any part which is not needed', function () {
            moduleSystem.createPart('testPart').creator(function () {});
            var spyPart = jasmine.createSpy('creator');
            moduleSystem.createPart('testPart2').creator(spyPart);

            moduleSystem.initModulePage();

            expect(spyPart).not.toHaveBeenCalled();
         });

         it('should add missing parts to the module', function () {
            var publicMethodObject = {
               testProperty: 'test'
            };
            moduleSystem.createPart('testPart').creator(function () {
               return publicMethodObject;
            });

            moduleSystem.initModulePage();


            expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), publicMethodObject);
         });

         it('should call postConstruct from parts when provision is finished', function () {
            var spyPartObject = jasmine.createSpyObj('part object', ['postConstruct']);

            var initWasCalled = false;

            spyPartObject.postConstruct.and.callFake(function () {
               expect(initWasCalled).toEqual(true);
            });

            var spyPart = jasmine.createSpy('spyPart').and.callFake(function () {
               initWasCalled = true;
               return spyPartObject;
            });


            moduleSystem.createPart('testPart').creator(spyPart);


            moduleSystem.initModulePage();


            expect(spyPartObject.postConstruct).toHaveBeenCalled();
         });

      });



   });


   it('should throw an exception if a module dependencie couldnt be resolved', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var spyModule = jasmine.createSpy();
      moduleSystem.createModule('testModule').dependencies(['dependencyPart']).creator(spyModule);

      expect(moduleSystem.initModulePage).toThrow();
   });




   it('should add every module to the event bus', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var eventBus = moduleSystem.getPart('eventBus');

      eventBus.add = jasmine.createSpy('add').and.callThrough();

      var publicMethodObject = {
         testProperty: 'test'
      };
      moduleSystem.createModule('testModule').creator(function () {
         return publicMethodObject;
      });


      moduleSystem.initModulePage();


      expect(eventBus.add).toHaveBeenCalledWith({
         name: 'testModule0',
         testProperty: 'test'
      });
   });

   it('should call postConstruct when provision is finished', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var spyModuleObject = jasmine.createSpyObj('module object', ['postConstruct']);
      var initWasCalled = false;

      spyModuleObject.postConstruct.and.callFake(function () {
         expect(initWasCalled).toEqual(true);
      });

      var spyModule = jasmine.createSpy('spyModule').and.callFake(function () {
         initWasCalled = true;
         return spyModuleObject;
      });


      moduleSystem.createModule('testModule').creator(spyModule);


      moduleSystem.initModulePage();


      expect(spyModuleObject.postConstruct).toHaveBeenCalled();
   });




});