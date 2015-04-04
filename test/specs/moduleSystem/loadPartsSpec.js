describe('Module system when loading parts', function () {

   beforeEach(function () {

      moduleSystem = moduleSystem.newInstance();
   });

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

   it('should merge settings with settings found in head of dom', function () {
      loadFixtures('moduleSystem/partSettings.html');
      $('#test-merging').appendTo('head'); //loads into head not possible with jasmine-jquery

      var settings = {
         def: 'default',
         override: 'should be overridden'
      };


      var spyPart = jasmine.createSpy('creator').and.returnValue({});
      moduleSystem.createPart('test-part')
         .settings(settings)
         .creator(spyPart);

      moduleSystem.getPart('test-part');

      expect(spyPart).toHaveBeenCalledWith({
         def: 'default',
         override: 'override',
         domSetting: 'domSetting'
      });

      $('head #test-merging').remove(); //remove the custom element in head

   });

   it('should not merge settings with settings found not in head of dom', function () {
      loadFixtures('moduleSystem/partSettings.html');
      var settings = {
         def: 'default',
         override: 'should not be overridden'
      };


      var spyPart = jasmine.createSpy('creator').and.returnValue({});
      moduleSystem.createPart('test-not-merging')
         .settings(settings)
         .creator(spyPart);

      moduleSystem.getPart('test-not-merging');

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