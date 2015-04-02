describe('Module System', function () {
   'use strict';

   beforeEach(function () {
      moduleSystem = moduleSystem.newInstance();
   });

   var loggerSpy;

   function initModulePage() {
      loggerSpy = jasmine.createSpy('logger');
      moduleSystem.initModulePage({
         logger: loggerSpy
      });
   }

   it('should not load a Module if not found in dom', function () {
      var spyModule = jasmine.createSpy('creator');
      moduleSystem.createModule('test-module').creator(spyModule);

      moduleSystem.initModulePage();

      expect(spyModule).not.toHaveBeenCalled();
   });

   describe('with eager singletons', function () {
      var throwingPart;
      var workingPart;

      beforeEach(function () {
         throwingPart = jasmine.createSpy('throwing-part').and.throwError();
         moduleSystem.createPart('throwing-part').scope(moduleSystem.scope.eagerSingleton).creator(throwingPart);

         workingPart = jasmine.createSpy('working-part');
         moduleSystem.createPart('working-part').scope(moduleSystem.scope.eagerSingleton).creator(workingPart);

         initModulePage();
      });

      it('should call the throwing part', function () {
         expect(throwingPart).toHaveBeenCalled();
      });

      it('should call the working part', function () {
         expect(workingPart).toHaveBeenCalled();
      });

      it('should log something', function () {
         expect(loggerSpy).toHaveBeenCalled();
      });
   });

   describe('with post constructs', function () {
      var throwingPostConstruct;
      var workingPostconstruct;

      beforeEach(function () {
         throwingPostConstruct = jasmine.createSpy('throwing-part').and.throwError();
         moduleSystem.createPart('throwing-part').scope(moduleSystem.scope.eagerSingleton).creator(function () {
            return {
               postConstruct: throwingPostConstruct
            };
         });

         workingPostconstruct = jasmine.createSpy('working-part');
         moduleSystem.createPart('working-part').scope(moduleSystem.scope.eagerSingleton).creator(function () {
            return {
               postConstruct: workingPostconstruct
            };
         });

         initModulePage();
      });

      it('should call the throwing part', function () {
         expect(throwingPostConstruct).toHaveBeenCalled();
      });

      it('should call the working part', function () {
         expect(workingPostconstruct).toHaveBeenCalled();
      });

      it('should log something', function () {
         expect(loggerSpy).toHaveBeenCalled();
      });
   });

   describe('with two modules', function () {
      beforeEach(function () {
         loadFixtures('moduleSystem/twoModules.html');
      });

      describe('when one module is not registered', function () {
         var workingModule;

         beforeEach(function () {
            workingModule = jasmine.createSpy('working module');
            moduleSystem.createModule('test-module2').creator(workingModule);

            initModulePage();
         });

         it('should call the working module', function () {
            expect(workingModule).toHaveBeenCalled();
         });

         it('should log something', function () {
            expect(loggerSpy).toHaveBeenCalled();
         });
      });

      describe('when one module postConstruct throws exception', function () {
         var throwingPostConstruct;
         var workingPostconstruct;

         beforeEach(function () {
            throwingPostConstruct = jasmine.createSpy('throwing-part').and.throwError();
            moduleSystem.createModule('test-module1').creator(function () {
               return {
                  postConstruct: throwingPostConstruct
               };
            });

            workingPostconstruct = jasmine.createSpy('working-part');
            moduleSystem.createPart('test-module2').creator(function () {
               return {
                  postConstruct: workingPostconstruct
               };
            });

            initModulePage();
         });

         it('should call the throwing part', function () {
            expect(throwingPostConstruct).toHaveBeenCalled();
         });

         it('should call the working part', function () {
            expect(workingPostconstruct).toHaveBeenCalled();
         });

         it('should log something', function () {
            expect(loggerSpy).toHaveBeenCalled();
         });
      });

      describe('when one module throws exception', function () {
         var errorModule;
         var workingModule;

         beforeEach(function () {
            errorModule = jasmine.createSpy('creator1').and.throwError('creator error');
            moduleSystem.createModule('test-module1').creator(errorModule);

            workingModule = jasmine.createSpy('creator2');
            moduleSystem.createModule('test-module2').creator(workingModule);

            initModulePage();
         });


         it('should call the throwing module', function () {
            expect(errorModule).toHaveBeenCalled();
         });

         it('should call the working module', function () {
            expect(workingModule).toHaveBeenCalled();
         });


         it('should log something', function () {
            expect(loggerSpy).toHaveBeenCalled();
         });

      });

      describe('when one module dependency can not be resolved', function () {
         var moduleWithoutWorkingDep;
         var workingModule;


         beforeEach(function () {
            moduleWithoutWorkingDep = jasmine.createSpy('creator1');
            moduleSystem.createModule('test-module1').dependencies(['not-registred']).creator(moduleWithoutWorkingDep);

            workingModule = jasmine.createSpy('creator2');
            moduleSystem.createModule('test-module2').creator(workingModule);

            initModulePage();

         });

         it('should not call the module if its dependency can not be resolved', function () {
            expect(moduleWithoutWorkingDep).not.toHaveBeenCalled();
         });

         it('should call the working module', function () {
            expect(workingModule).toHaveBeenCalled();
         });


         it('should log something', function () {
            expect(loggerSpy).toHaveBeenCalled();
         });
      });

      describe('when one module dependency throws an error', function () {
         var moduleWithoutWorkingDep;
         var workingModule;
         var throwingPart;


         beforeEach(function () {
            throwingPart = jasmine.createSpy('error-part').and.throwError('part creator error');
            moduleSystem.createPart('error-dependency').creator(throwingPart);

            moduleWithoutWorkingDep = jasmine.createSpy('creator1');
            moduleSystem.createModule('test-module1').dependencies(['error-dependency']).creator(moduleWithoutWorkingDep);

            workingModule = jasmine.createSpy('creator2');
            moduleSystem.createModule('test-module2').creator(workingModule);

            initModulePage();

         });

         it('should call the throwing part', function () {
            expect(throwingPart).toHaveBeenCalled();
         });

         it('should not call the module which dependency throws an error', function () {
            expect(moduleWithoutWorkingDep).not.toHaveBeenCalled();
         });

         it('should call the working module', function () {
            expect(workingModule).toHaveBeenCalled();
         });


         it('should log something', function () {
            expect(loggerSpy).toHaveBeenCalled();
         });
      });

      describe('when one module second level dependency throws an error', function () {
         var moduleWithoutWorkingDep;
         var workingModule;
         var throwingPart;
         var workingPart;


         beforeEach(function () {
            throwingPart = jasmine.createSpy('error-part').and.throwError('part creator error');
            moduleSystem.createPart('error-part').creator(throwingPart);

            workingPart = jasmine.createSpy('working-part');
            moduleSystem.createPart('working-part').dependencies(['error-part']).creator(workingPart);

            moduleWithoutWorkingDep = jasmine.createSpy('module without working dependency');
            moduleSystem.createModule('test-module1').dependencies(['working-part']).creator(moduleWithoutWorkingDep);

            workingModule = jasmine.createSpy('working module');
            moduleSystem.createModule('test-module2').creator(workingModule);

            initModulePage();

         });

         it('should call the throwing part', function () {
            expect(throwingPart).toHaveBeenCalled();
         });

         it('should not call 1 level dependency', function () {
            expect(workingPart).not.toHaveBeenCalled();
         });

         it('should not call the module which dependency throws an error', function () {
            expect(moduleWithoutWorkingDep).not.toHaveBeenCalled();
         });

         it('should call the working module', function () {
            expect(workingModule).toHaveBeenCalled();
         });

         it('should log something', function () {
            expect(loggerSpy).toHaveBeenCalled();
         });
      });
   });


   describe('with wrong formatted JSON', function () {
      var wrongFormattedJSONModule;
      var workingModule;

      beforeEach(function () {
         loadFixtures('moduleSystem/twoModuleOneWithWrongFormattetSettings.html');

         wrongFormattedJSONModule = jasmine.createSpy('wrongFormattedJSONModule');
         moduleSystem.createModule('test-module1').creator(wrongFormattedJSONModule);

         workingModule = jasmine.createSpy('creator2');
         moduleSystem.createModule('test-module2').creator(workingModule);

         initModulePage();
      });

      it('should not call the wrong formatted json module', function () {
         expect(wrongFormattedJSONModule).not.toHaveBeenCalled();
      });

      it('should call the working module', function () {
         expect(workingModule).toHaveBeenCalled();
      });

      it('should log something', function () {
         expect(loggerSpy).toHaveBeenCalled();
      });
   });

});