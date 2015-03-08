describe('The Module Loader', function () {
   'use strict';

   afterEach(function () {
      moduleSystem = moduleSystem.newInstance();
   });

   it('should get new instance of part when selecting default scope', function () {
      loadFixtures('moduleSystem/oneModule.html');

      var dependencyForFirstSpy, dependencyForSecondSpy;
      var firstSpyPart = jasmine.createSpy('spyPart_1').and.callFake(
         function (dependencyPart) {
            dependencyForFirstSpy = dependencyPart;
         }
      );
      var secondSpyPart = jasmine.createSpy('spyPart_2').and.callFake(
         function (dependencyPart) {
            dependencyForSecondSpy = dependencyPart;
         }
      );
      var referencedPart = 'partName';
      moduleSystem.createPart(referencedPart).creator(
         function () {
            return {
               /*
                * returns empty part object
                */
            };
         }
      );

      moduleSystem.createPart('spyPart1').dependencies([referencedPart]).creator(firstSpyPart);
      moduleSystem.createPart('spyPart2').dependencies([referencedPart]).creator(secondSpyPart);
      moduleSystem.getPart('spyPart1');
      moduleSystem.getPart('spyPart2');

      expect(dependencyForFirstSpy).not.toBe(dependencyForSecondSpy);
   });

   it('should get same instance of part when selecting singleton scope', function () {

      var dependencyForFirstSpy, dependencyForSecondSpy;
      var firstSpyPart = jasmine.createSpy('spyPart_1').and.callFake(
         function (dependencyPart) {
            dependencyForFirstSpy = dependencyPart;
         }
      );
      var secondSpyPart = jasmine.createSpy('spyPart_2').and.callFake(
         function (dependencyPart) {
            dependencyForSecondSpy = dependencyPart;
         }
      );
      var referencedPart = 'partName';
      moduleSystem.createPart(referencedPart).scope(moduleSystem.const.scope.singleton).creator(
         function () {
            return {
               /*
                * returns empty part object
                */
            };
         }
      );

      moduleSystem.createPart('spyPart1').dependencies([referencedPart]).creator(firstSpyPart);
      moduleSystem.createPart('spyPart2').dependencies([referencedPart]).creator(secondSpyPart);
      moduleSystem.getPart('spyPart1');
      moduleSystem.getPart('spyPart2');

      expect(dependencyForFirstSpy).toBe(dependencyForSecondSpy);
   });

   it('should throw error when defining an invalid scope', function () {
      loadFixtures('moduleSystem/oneModule.html');

      var dependencyForFirstSpy, dependencyForSecondSpy;
      var firstSpyPart = jasmine.createSpy('spyPart_1').and.callFake(
         function (dependencyPart) {
            dependencyForFirstSpy = dependencyPart;
         }
      );
      var referencedPart = 'partName';
      moduleSystem.createPart(referencedPart).scope('invalid').creator(
         function () {
            return {
               /*
                * returns empty part object
                */
            };
         }
      );

      moduleSystem.createPart('spyPart1').dependencies([referencedPart]).creator(firstSpyPart);
      moduleSystem.createModule('testModule').dependencies(['spyPart1']).creator(function () {});

      expect(moduleSystem.initModulePage).toThrowError();
   });

   it('should provide Modules with static dependencies', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var spyModule = jasmine.createSpy('creator');
      var staticDependency = 'test Static';

      moduleSystem.createPart('staticDependency').returns(staticDependency);
      moduleSystem.createModule('testModule').dependencies(['staticDependency']).creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), staticDependency);


   });

   it('should load any Module found in dom', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).toHaveBeenCalled();
      expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-testModule'));
   });

   it('should load module with configured selector and attribute', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage({
         selector: '.js-module',
         attribute: 'data-modules'
      });

      expect(spyModule).toHaveBeenCalled();
      expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-selectorAndAttributeModule'));
   });

   it('should load module with configured attribute', function () {
      loadFixtures('moduleSystem/oneModule.html');
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage({
         attribute: 'data-mods'
      });

      expect(spyModule).toHaveBeenCalled();
      expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-attributeModule'));
   });


   it('should load a comma seperated list of Modules found in dom', function () {
      loadFixtures('moduleSystem/twoModules.html');
      var spyModule1 = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule1').creator(spyModule1);

      var spyModule2 = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule2').creator(spyModule2);

      moduleSystem.initModulePage();

      expect(spyModule1).toHaveBeenCalled();
      expect(spyModule1.calls.argsFor(0)[0]).toBe(document.getElementById('test-testModule'));

      expect(spyModule2).toHaveBeenCalled();
      expect(spyModule2.calls.argsFor(0)[0]).toBe(document.getElementById('test-testModule'));
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

   it('should create a module for every module in dom', function () {
      loadFixtures('moduleSystem/twoIdenticalModules.html');
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('testModule').creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule.calls.count()).toBe(2);
      expect(spyModule.calls.argsFor(0)[0]).toBe($('#test-testModule1').get(0));
      expect(spyModule.calls.argsFor(1)[0]).toBe($('#test-testModule2').get(0));
   });

   it('should not throw if the same module is found multiple times in dom', function () {
      loadFixtures('moduleSystem/twoIdenticalModules.html');

      var spyModule = jasmine.createSpy('creator').and.callFake(function () {
         return {};
      });
      moduleSystem.createModule('testModule').creator(spyModule);

      expect(moduleSystem.initModulePage).not.toThrow();
   });

   it('should call post construct from multiple times', function () {
      loadFixtures('moduleSystem/twoIdenticalModules.html');

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

      moduleSystem.createModule('testModule').creator(creator);

      moduleSystem.initModulePage();

      expect(spyModule1.postConstruct).toHaveBeenCalled();
      expect(spyModule2.postConstruct).toHaveBeenCalled();
   });

   it('should Throw if a Module in the dom is not registered', function () {
      loadFixtures('moduleSystem/oneModule.html');

      expect(moduleSystem.initModulePage).toThrow();
   });

   describe('with parts', function () {
      var spyModule;

      it('should get a part', function () {
         var partObj = {
            test: 'test'
         };
         var spyPart = jasmine.createSpy('creator').and.returnValue(partObj);
         moduleSystem.createPart('testPart').creator(spyPart);

         expect(moduleSystem.getPart('testPart')).toEqual(partObj);
      });

      it('should not reinitilize part if allready initialized', function () {
         var partObj = {
            test: 'test'
         };
         var spyPart = jasmine.createSpy('creator').and.returnValue(partObj);
         moduleSystem.createPart('testPart').scope(moduleSystem.const.scope.singleton).creator(spyPart);

         moduleSystem.getPart('testPart');
         var partObjActual = moduleSystem.getPart('testPart');

         expect(partObj).toEqual(partObjActual);
         expect(spyPart.calls.count()).toEqual(1);

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
            moduleSystem.getPart('testPart');
         }).toThrow();
      });

      it('should throw an exception on circular dependencies', function () {
         var spyPart = jasmine.createSpy();
         moduleSystem.createPart('testPart').dependencies(['dependencyPart']).creator(spyPart);
         moduleSystem.createPart('dependencyPart').dependencies(['testPart']).creator(spyPart);

         expect(function () {
            moduleSystem.getPart('testPart');
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

         it('should call postConstruct when get part is called', function () {
            var spyPartObject = jasmine.createSpyObj('part object', ['postConstruct']);
            var postConstructSpy = spyPartObject.postConstruct;


            moduleSystem.createPart('testPart')
               .creator(function () {
                  return spyPartObject;
               });


            moduleSystem.getPart('testPart');


            expect(postConstructSpy).toHaveBeenCalled();
         });


         it('should call postConstruct from multi instance parts again', function () {
            var postConstructSpy = jasmine.createSpy('post construct');


            moduleSystem.createPart('testPart')
               .creator(function () {
                  return {
                     postConstruct: postConstructSpy
                  };
               });


            moduleSystem.getPart('testPart');
            moduleSystem.getPart('testPart');


            expect(postConstructSpy.calls.count()).toEqual(2);
         });

         it('should call postConstruct from singleton parts once', function () {
            var postConstructSpy = jasmine.createSpy('post construct');


            moduleSystem.createPart('testPart')
               .scope(moduleSystem.const.scope.singleton)
               .creator(function () {
                  return {
                     postConstruct: postConstructSpy
                  };
               });


            moduleSystem.getPart('testPart');
            moduleSystem.getPart('testPart');


            expect(postConstructSpy.calls.count()).toEqual(1);
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