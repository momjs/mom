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

      describe('with dependency from module', function () {
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
});
