describe('Module system when loading parts', function () {

   beforeEach(function () {

      mom = mom.newInstance();
   });

   it('should get a part', function () {
      var partObj = {
         test: 'test'
      };
      var spyPart = jasmine.createSpy('creator').and.returnValue(partObj);
      mom.createPart('test-part').creator(spyPart);

      expect(mom.getPart('test-part')).toEqual(partObj);
   });

   it('should not reinitilize part if allready initialized', function () {
      var partObj = {
         test: 'test'
      };
      var spyPart = jasmine.createSpy('creator').and.returnValue(partObj);
      mom.createPart('test-part').scope(mom.scope.lazySingleton).creator(spyPart);

      mom.getPart('test-part');
      var partObjActual = mom.getPart('test-part');

      expect(partObj).toEqual(partObjActual);
      expect(spyPart.calls.count()).toEqual(1);

   });

   it('should call postConstruct from multi instance parts again', function () {
      var postConstructSpy1 = jasmine.createSpy('post construct');
      var postConstructSpy2 = jasmine.createSpy('post construct');
      var first = true;

      mom.createPart('test-part')
         .creator(function () {
            var postConstruct;
            if(first) {
               postConstruct = postConstructSpy1;
               first = false;
            } else {
               postConstruct = postConstructSpy2;
            }

            return {
               postConstruct: postConstruct
            };
         });


      mom.getPart('test-part');
      mom.getPart('test-part');


      expect(postConstructSpy1.calls.count()).toEqual(1);
      expect(postConstructSpy2.calls.count()).toEqual(1);
   });

   it('should call postConstruct from lazy singleton parts once', function () {
      var postConstructSpy = jasmine.createSpy('post construct');


      mom.createPart('test-part')
         .scope(mom.scope.lazySingleton)
         .creator(function () {
            return {
               postConstruct: postConstructSpy
            };
         });


      mom.getPart('test-part');
      mom.getPart('test-part');


      expect(postConstructSpy.calls.count()).toEqual(1);
   });

   it('should provide a settings object to the part if specified', function () {
      var settings = {
         testSetting: 'test'
      };

      var spyPart = jasmine.createSpy('creator').and.returnValue({});
      mom.createPart('test-part')
         .settings(settings)
         .creator(spyPart);

      mom.getPart('test-part');

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
      mom.createPart('test-part')
         .settings(settings)
         .creator(spyPart);

      mom.getPart('test-part');

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
      mom.createPart('test-not-merging')
         .settings(settings)
         .creator(spyPart);

      mom.getPart('test-not-merging');

      expect(spyPart).toHaveBeenCalledWith(settings);

   });

   it('should add missing Parts to Parts', function () {
      var testPart = jasmine.createSpy('test part');
      var publicMethodObject = {
         testProperty: 'test'
      };
      mom.createPart('dependency-part').creator(function () {
         return publicMethodObject;
      });
      mom.createPart('test-part').dependencies(['dependency-part']).creator(testPart);

      mom.getPart('test-part');


      expect(testPart).toHaveBeenCalledWith(publicMethodObject);
   });

   it('should throw an exception if a part dependencie couldnt be resolved', function () {
      var spyPart = jasmine.createSpy();
      mom.createPart('test-part').dependencies(['dependency-part']).creator(spyPart);

      expect(function () {
         mom.getPart('test-part');
      }).toThrow();
   });

   it('should throw an exception on circular dependencies', function () {
      var spyPart = jasmine.createSpy();
      mom.createPart('test-part').dependencies(['dependency-part']).creator(spyPart);
      mom.createPart('dependency-part').dependencies(['test-part']).creator(spyPart);

      expect(function () {
         mom.getPart('test-part');
      }).toThrowError('Circular dependency detected for part [test-part]');
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
      mom.createPart(referencedPart).creator(
         function () {
            return {
               /*
                * returns empty part object
                */
            };
         }
      );

      mom.createPart('spy-part-1').dependencies([referencedPart]).creator(firstSpyPart);
      mom.createPart('spy-part-2').dependencies([referencedPart]).creator(secondSpyPart);
      mom.getPart('spy-part-1');
      mom.getPart('spy-part-2');

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
      mom.createPart(referencedPart).scope(mom.scope.lazySingleton).creator(
         function () {
            return {
               /*
                * returns empty part object
                */
            };
         }
      );

      mom.createPart('spyPart1').dependencies([referencedPart]).creator(firstSpyPart);
      mom.createPart('spyPart2').dependencies([referencedPart]).creator(secondSpyPart);
      mom.getPart('spyPart1');
      mom.getPart('spyPart2');

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
      mom.createPart(referencedPart).scope(mom.scope.eagerSingleton).creator(
         function () {
            return {
               /*
                * returns empty part object
                */
            };
         }
      );

      mom.createPart('spy-part-1').dependencies([referencedPart]).creator(firstSpyPart);
      mom.createPart('spy-part-2').dependencies([referencedPart]).creator(secondSpyPart);
      mom.getPart('spy-part-1');
      mom.getPart('spy-part-2');

      expect(dependencyForFirstSpy).toBe(dependencyForSecondSpy);
   });


   it('should load any eagersingleton part', function () {
      var postConstructSpy = jasmine.createSpy('post construct');
      var spyPart = jasmine.createSpy('creator').and.callFake(function () {
         return {
            postConstruct: postConstructSpy
         };
      });
      mom.createPart('test-part').scope(mom.scope.eagerSingleton).creator(spyPart);

      mom.initModulePage();

      expect(spyPart).toHaveBeenCalled();
      expect(postConstructSpy).toHaveBeenCalled();
   });
});