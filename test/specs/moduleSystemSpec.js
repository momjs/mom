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

   describe('on loading parts', function() {

      it('should get new instance of part when selecting default scope', function () {

         var dependencyForFirstSpy, dependencyForSecondSpy;
         var firstSpyPart = jasmine.createSpy('spy-part-1').and.callFake(
            function (dependencyPart) {
               dependencyForFirstSpy = dependencyPart;
            }
         );
         var secondSpyPart = jasmine.createSpy('spy-part-2').and.callFake(
            function (dependencyPart) {
               dependencyForSecondSpy = dependencyPart;
            }
         );

         var referencedPart = 'part-name';
         moduleSystem.createPart(referencedPart).creator(
            function () {
               return {
                  /*
                   * returns empty part object
                   */
               };
            }
         );

         moduleSystem.createPart('spy-part-1').dependencies([referencedPart]).creator(firstSpyPart);
         moduleSystem.createPart('spy-part-2').dependencies([referencedPart]).creator(secondSpyPart);
         moduleSystem.getPart('spy-part-1');
         moduleSystem.getPart('spy-part-2');

         expect(dependencyForFirstSpy).not.toBe(dependencyForSecondSpy);
      });

      it('should get same instance of part when selecting lazy singleton scope', function () {

         var dependencyForFirstSpy, dependencyForSecondSpy;
         var firstSpyPart = jasmine.createSpy('spy-part-1').and.callFake(
            function (dependencyPart) {
               dependencyForFirstSpy = dependencyPart;
            }
         );
         var secondSpyPart = jasmine.createSpy('spy-part-2').and.callFake(
            function (dependencyPart) {
               dependencyForSecondSpy = dependencyPart;
            }
         );
         var referencedPart = 'part-name';
         moduleSystem.createPart(referencedPart).scope(moduleSystem.scope.lazySingleton).creator(
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

      it('should get same instance of part when selecting eager singleton scope', function () {

         var dependencyForFirstSpy, dependencyForSecondSpy;
         var firstSpyPart = jasmine.createSpy('spy-part-1').and.callFake(
            function (dependencyPart) {
               dependencyForFirstSpy = dependencyPart;
            }
         );
         var secondSpyPart = jasmine.createSpy('spy-part-2').and.callFake(
            function (dependencyPart) {
               dependencyForSecondSpy = dependencyPart;
            }
         );
         var referencedPart = 'part-name';
         moduleSystem.createPart(referencedPart).scope(moduleSystem.scope.eagerSingleton).creator(
            function () {
               return {
                  /*
                   * returns empty part object
                   */
               };
            }
         );

         moduleSystem.createPart('spy-part-1').dependencies([referencedPart]).creator(firstSpyPart);
         moduleSystem.createPart('spy-part-2').dependencies([referencedPart]).creator(secondSpyPart);
         moduleSystem.getPart('spy-part-1');
         moduleSystem.getPart('spy-part-2');

         expect(dependencyForFirstSpy).toBe(dependencyForSecondSpy);
      });


      it('should load any eagersingleton part', function () {
         var postConstructSpy = jasmine.createSpy('post construct');
         var spyPart = jasmine.createSpy('creator').and.callFake(function () {
            return {
               postConstruct: postConstructSpy
            };
         });
         moduleSystem.createPart('test-part').scope(moduleSystem.scope.eagerSingleton).creator(spyPart);

         moduleSystem.initModulePage();

         expect(spyPart).toHaveBeenCalled();
         expect(postConstructSpy).toHaveBeenCalled();
      });
   });



   describe('when loading more than one module', function() {

      var spyModule1;
      var spyModule2;

      beforeEach(function() {

         spyModule1 = jasmine.createSpy('creator');
         spyModule2 = jasmine.createSpy('creator');
      });

      describe('when loading simple modules', function() {

         beforeEach(function() {

            moduleSystem.createModule('test-module1').creator(spyModule1);
            moduleSystem.createModule('test-module2').creator(spyModule2);
         });

         describe('on parallel dom nodes', function() {

            beforeEach(function() {

               loadFixtures('moduleSystem/twoModules.html');
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

         describe('on two parallel identical dom nodes', function() {

            beforeEach(function() {

               loadFixtures('moduleSystem/twoIdenticalModules.html');
            });

            it('should create a module for every module in dom', function () {
               var spyModule = jasmine.createSpy('creator');
               moduleSystem.createModule('test-module').creator(spyModule);

               moduleSystem.initModulePage();

               expect(spyModule.calls.count()).toBe(2);
               expect(spyModule.calls.argsFor(0)[0]).toBe(document.getElementById('test-module1'));
               expect(spyModule.calls.argsFor(1)[0]).toBe(document.getElementById('test-module12'));
            });

            it('should not throw if the same module is found multiple times in dom', function () {

               var spyModule = jasmine.createSpy('creator').and.callFake(function () {
                  return {};
               });
               moduleSystem.createModule('test-module').creator(spyModule);

               expect(moduleSystem.initModulePage).not.toThrow();
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

               moduleSystem.createModule('test-module').creator(creator);

               moduleSystem.initModulePage();

               expect(spyModule1.postConstruct).toHaveBeenCalled();
               expect(spyModule2.postConstruct).toHaveBeenCalled();
            });
         });
      });
   });

   describe('with parts', function () {
      var spyModule;

      it('should get a part', function () {
         var partObj = {
            test: 'test'
         };
         var spyPart = jasmine.createSpy('creator').and.returnValue(partObj);
         moduleSystem.createPart('test-part').creator(spyPart);

         expect(moduleSystem.getPart('test-part')).toEqual(partObj);
      });

      it('should not reinitilize part if allready initialized', function () {
         var partObj = {
            test: 'test'
         };
         var spyPart = jasmine.createSpy('creator').and.returnValue(partObj);
         moduleSystem.createPart('test-part').scope(moduleSystem.scope.lazySingleton).creator(spyPart);

         moduleSystem.getPart('test-part');
         var partObjActual = moduleSystem.getPart('test-part');

         expect(partObj).toEqual(partObjActual);
         expect(spyPart.calls.count()).toEqual(1);

      });

      it('should call postConstruct from multi instance parts again', function () {
         var postConstructSpy = jasmine.createSpy('post construct');


         moduleSystem.createPart('test-part')
            .creator(function () {
               return {
                  postConstruct: postConstructSpy
               };
            });


         moduleSystem.getPart('test-part');
         moduleSystem.getPart('test-part');


         expect(postConstructSpy.calls.count()).toEqual(2);
      });

      it('should call postConstruct from lazy singleton parts once', function () {
         var postConstructSpy = jasmine.createSpy('post construct');


         moduleSystem.createPart('test-part')
            .scope(moduleSystem.scope.lazySingleton)
            .creator(function () {
               return {
                  postConstruct: postConstructSpy
               };
            });


         moduleSystem.getPart('test-part');
         moduleSystem.getPart('test-part');


         expect(postConstructSpy.calls.count()).toEqual(1);
      });

      it('should provide a settings object to the part if specified', function () {
         var settings = {
            testSetting: 'test'
         };

         var spyPart = jasmine.createSpy('creator').and.returnValue({});
         moduleSystem.createPart('test-part')
            .settings(settings)
            .creator(spyPart);

         moduleSystem.getPart('test-part');

         expect(spyPart).toHaveBeenCalledWith(settings);
      });

      it('should add missing Parts to Parts', function () {
         var testPart = jasmine.createSpy('test part');
         var publicMethodObject = {
            testProperty: 'test'
         };
         moduleSystem.createPart('dependency-part').creator(function () {
            return publicMethodObject;
         });
         moduleSystem.createPart('test-part').dependencies(['dependency-part']).creator(testPart);

         moduleSystem.getPart('test-part');


         expect(testPart).toHaveBeenCalledWith(publicMethodObject);
      });

      it('should throw an exception if a part dependencie couldnt be resolved', function () {
         var spyPart = jasmine.createSpy();
         moduleSystem.createPart('test-part').dependencies(['dependency-part']).creator(spyPart);

         expect(function () {
            moduleSystem.getPart('test-part');
         }).toThrow();
      });

      it('should throw an exception on circular dependencies', function () {
         var spyPart = jasmine.createSpy();
         moduleSystem.createPart('test-part').dependencies(['dependency-part']).creator(spyPart);
         moduleSystem.createPart('dependency-part').dependencies(['test-part']).creator(spyPart);

         expect(function () {
            moduleSystem.getPart('test-part');
         }).toThrow();

      });

      describe('with dependencie from module', function () {
         beforeEach(function () {
            loadFixtures('moduleSystem/oneModule.html');
            spyModule = jasmine.createSpy('module');

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


   it('should add every module to the event bus', function () {
      loadFixtures('moduleSystem/oneModule.html');
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


      moduleSystem.createModule('test-module').creator(spyModule);


      moduleSystem.initModulePage();


      expect(spyModuleObject.postConstruct).toHaveBeenCalled();
   });
});
