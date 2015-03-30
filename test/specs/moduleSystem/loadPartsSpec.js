describe('Module system when loading parts', function() {

   beforeEach(function() {

      moduleSystem = moduleSystem.newInstance();
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
