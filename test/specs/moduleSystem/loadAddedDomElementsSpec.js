describe('Module system', function() {

   var $parentDiv;

   var existingModuleCreator;
   var existingModuleObject;

   var firstSpyModule;
   var secondSpyModule;

   var firstSpyModuleObject;
   var firstSpyModuleObject_secondInstance;
   var secondSpyModuleObject;

   var eventBus;

   var DEFAULT_CUSTOM_ID = 'mom-id';

   var WAIT_TIME_FOR_MUTATION_EVENT = 0;
   var MAX_WAIT_TIME = 1000;

   beforeEach(function() {

      moduleSystem = moduleSystem.newInstance();

      loadFixtures('moduleSystem/simpleModuleDiv.html');
      $parentDiv = $('#test-div');

      existingModuleObject = jasmine.createSpyObj('existingModuleObject', ['postConstruct']);
      firstSpyModuleObject = jasmine.createSpyObj('spyModuleObj1a', ['onEvent', 'postConstruct']);
      firstSpyModuleObject_secondInstance = jasmine.createSpyObj('spyModuleObj1b', ['onEvent', 'postConstruct']);
      secondSpyModuleObject = jasmine.createSpyObj('spyModuleObj2', ['onEvent', 'postConstruct']);

      var getFirstSpy = (function() {
         var hasBeenCalled = false;

         return function() {
            if(hasBeenCalled === true) {
               return firstSpyModuleObject_secondInstance;
            }
            else {
               hasBeenCalled = true;
               return firstSpyModuleObject;
            }
         }
      })();

      existingModuleCreator = jasmine.createSpy('spyModule').and.returnValue(existingModuleObject);

      firstSpyModule = jasmine.createSpy('spyModule1').and.callFake(getFirstSpy);

      secondSpyModule = jasmine.createSpy('spyModule2').and.returnValue(secondSpyModuleObject);

      moduleSystem.createModule('test-module').creator(existingModuleCreator);
      moduleSystem.createModule('test-module1').creator(firstSpyModule);
      moduleSystem.createModule('test-module2').creator(secondSpyModule);

   });

   afterEach(function() {
      moduleSystem.dispose();
   });

   describe('when dom mutation support is enabled', function() {

      beforeEach(function() {
         var settings = {
            domMutationSupport: true
         };

         moduleSystem.initModulePage(settings);

         eventBus = moduleSystem.getPart('event-bus');
      });

      describe('on adding a dom node with one module', function() {

         var ADDED_DIV_ID = 'test-addedDiv';
         var ADDED_DIV_SELECTOR = '#test-addedDiv';

         beforeEach(function(done) {
            var elementToAddAsTest = '<div id="' + ADDED_DIV_ID + '" modules="test-module1"></div>';

            $(elementToAddAsTest).
               appendTo($parentDiv);

            setTimeout(function() {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should NOT call postConstruct of existing module TWICE', function() {

            expect(existingModuleObject.postConstruct).toHaveBeenCalled();
            expect(existingModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should call the existing module creator function once (on page init)', function() {

            expect(existingModuleCreator).toHaveBeenCalled();
            expect(existingModuleCreator.calls.count()).toBe(1);
         });

         it('should call the added module creator function', function() {

            expect(firstSpyModule).toHaveBeenCalled();
            expect(firstSpyModule.calls.count()).toBe(1);
         });

         it('should pass the moduleObject to added moduleCreator', function() {

            expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:ADDED_DIV_ID}));
         });

         it('should call postConstruct on module', function() {

            expect(firstSpyModuleObject.postConstruct).toHaveBeenCalled();
            expect(firstSpyModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should set the joj-id attribute to the dom element', function() {

            expect(ADDED_DIV_SELECTOR).toHaveAttr(DEFAULT_CUSTOM_ID);
         });

         describe('when event has been published', function() {

            var publishedEvent;

            beforeEach(function() {

               publishedEvent = {
                  name : 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on added module once', function() {

               expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on added module with expected event', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });
         });
      });

      describe('on adding a dom node with a child module', function() {

         var ADDED_DIV_ID = 'test-addedDiv';

         beforeEach(function(done) {

            var elementToAddAsTest = '<div><div id="' + ADDED_DIV_ID + '" modules="test-module1"></div></div>';

            $(elementToAddAsTest).
               appendTo($parentDiv);

            setTimeout(function() {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call the module creator function', function() {

            expect(firstSpyModule).toHaveBeenCalled();
            expect(firstSpyModule.calls.count()).toBe(1);
         });

         it('should pass the created moduleObject to moduleCreator', function() {

            expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:ADDED_DIV_ID}));
         });

         it('should call postConstruct on module', function() {

            expect(firstSpyModuleObject.postConstruct.calls.count()).toBe(1);
         });

         describe('when event has been published', function() {

            var publishedEvent;

            beforeEach(function() {

               publishedEvent = {
                  name : 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on added module once', function() {

               expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on added module with expected event', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });
         });
      });

      describe('on adding a dom node with two child modules', function() {

         var FIRST_ADDED_DIV_ID = 'test-addedDiv1';
         var SECOND_ADDED_DIV_ID = 'test-addedDiv2';

         beforeEach(function(done) {

            var elementToAddAsTest = '<div>' +
               '<div id="' + FIRST_ADDED_DIV_ID + '" modules="test-module1"></div>' +
               '<div id="' + SECOND_ADDED_DIV_ID + '" modules="test-module1"></div>' +
               '</div>';

            $(elementToAddAsTest).
               appendTo($parentDiv);

            setTimeout(function() {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call the module creator function twice', function() {

            expect(firstSpyModule.calls.count()).toBe(2);
         });

         it('should pass the moduleObject to first moduleCreator', function() {

            expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
         });

         it('should pass the moduleObject to second moduleCreator', function() {

            expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:SECOND_ADDED_DIV_ID}));
         });

         it('should call postConstruct on module', function() {

            expect(firstSpyModuleObject.postConstruct).toHaveBeenCalled();
            expect(firstSpyModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should call postConstruct on 2nd instance module', function() {

            expect(firstSpyModuleObject_secondInstance.postConstruct).toHaveBeenCalled();
            expect(firstSpyModuleObject_secondInstance.postConstruct.calls.count()).toBe(1);
         });

         describe('when event has been published', function() {

            var publishedEvent;

            beforeEach(function() {

               publishedEvent = {
                  name : 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on first instance of added module 1', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalled();
               expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on first instance of added module 1 with expected event', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });

            it('should call event listener function on second instance of added module 1', function() {

               expect(firstSpyModuleObject_secondInstance.onEvent).toHaveBeenCalled();
               expect(firstSpyModuleObject_secondInstance.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on second instance of added module 1 with expected event', function() {

               expect(firstSpyModuleObject_secondInstance.onEvent).toHaveBeenCalledWith(publishedEvent);
            });
         });
      });

      describe('on adding a dom node with two different child modules', function() {

         var FIRST_ADDED_DIV_ID = 'test-addedDiv';
         var SECOND_ADDED_DIV_ID = 'test-addedDiv';

         beforeEach(function(done) {

            var elementToAddAsTest = '<div>' +
               '<div id="' + FIRST_ADDED_DIV_ID + '" modules="test-module1"></div>' +
               '<div id="' + SECOND_ADDED_DIV_ID + '" modules="test-module2"></div>' +
               '</div>';

            $(elementToAddAsTest).
               appendTo($parentDiv);

            setTimeout(function() {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call the first module creator function', function() {

            expect(firstSpyModule).toHaveBeenCalled();
            expect(firstSpyModule.calls.count()).toBe(1);
         });

         it('should call the second module creator function', function() {

            expect(secondSpyModule).toHaveBeenCalled();
            expect(secondSpyModule.calls.count()).toBe(1);
         });

         it('should pass the moduleObject to first moduleCreator', function() {

            expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
         });

         it('should pass the moduleObject to second moduleCreator', function() {

            expect(secondSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:SECOND_ADDED_DIV_ID}));
         });

         it('should call postConstruct on first module', function() {

            expect(firstSpyModuleObject.postConstruct.calls.count()).toBe(1);
         });

         it('should call postConstruct on second module', function() {

            expect(secondSpyModuleObject.postConstruct.calls.count()).toBe(1);
         });

         describe('when event has been published', function() {

            var publishedEvent;

            beforeEach(function() {

               publishedEvent = {
                  name : 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on first added module once', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalled();
               expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on first added module with expected event', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });

            it('should call event listener function on second added module once', function() {

               expect(secondSpyModuleObject.onEvent).toHaveBeenCalled();
               expect(secondSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on second added module with expected event', function() {

               expect(secondSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });
         });
      });

      describe('on adding a dom node with two different child modules', function() {

         var FIRST_ADDED_DIV_ID = 'test-addedDiv';

         beforeEach(function(done) {

            var elementToAddAsTest = '<div>' +
               '<div id="' + FIRST_ADDED_DIV_ID + '" modules="test-module1,test-module2"></div>' +
               '</div>';

            $(elementToAddAsTest).
               appendTo($parentDiv);

            setTimeout(function() {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call the first module creator function', function() {

            expect(firstSpyModule).toHaveBeenCalled();
            expect(firstSpyModule.calls.count()).toBe(1);
         });

         it('should call the second module creator function', function() {

            expect(secondSpyModule).toHaveBeenCalled();
            expect(secondSpyModule.calls.count()).toBe(1);
         });

         it('should pass the moduleObject to first moduleCreator', function() {

            expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
         });

         it('should pass the moduleObject to second moduleCreator', function() {

            expect(secondSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:FIRST_ADDED_DIV_ID}));
         });

         describe('when event has been published', function() {

            var publishedEvent;

            beforeEach(function() {

               publishedEvent = {
                  name : 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on first added module once', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalled();
               expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on first added module with expected event', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });

            it('should call event listener function on second added module once', function() {

               expect(secondSpyModuleObject.onEvent).toHaveBeenCalled();
               expect(secondSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on second added module with expected event', function() {

               expect(secondSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });
         });
      });

      describe('on adding a dom node with one module with nested settings', function() {

         var ADDED_DIV_ID = 'test-addedDiv';

         beforeEach(function(done) {

            var elementToAddAsTest = '<div id="' + ADDED_DIV_ID + '" modules="test-module1">' +
               '<script type="test-module1/settings">' +
               '{ "myProperty" : "my value" }' +
               '</script>' +
               '</div>';

            $(elementToAddAsTest).
               appendTo($parentDiv);

            setTimeout(function() {
               done();
            }, WAIT_TIME_FOR_MUTATION_EVENT);
         }, MAX_WAIT_TIME);

         it('should call the existing module creator function once (on page init)', function() {

            expect(existingModuleCreator).toHaveBeenCalled();
            expect(existingModuleCreator.calls.count()).toBe(1);
         });

         it('should call the added module creator function', function() {

            expect(firstSpyModule).toHaveBeenCalled();
            expect(firstSpyModule.calls.count()).toBe(1);
         });

         it('should pass the moduleObject to added moduleCreator', function() {

            expect(firstSpyModule).toHaveBeenCalledWith(
               jasmine.objectContaining({id:ADDED_DIV_ID}),
               jasmine.objectContaining({ "myProperty" : "my value" }));
         });

         describe('when event has been published', function() {

            var publishedEvent;

            beforeEach(function() {

               publishedEvent = {
                  name : 'MyTestEvent'
               };

               eventBus.publish(publishedEvent);
            });

            it('should call event listener function on added module once', function() {

               expect(firstSpyModuleObject.onEvent.calls.count()).toBe(1);
            });

            it('should call event listener function on added module with expected event', function() {

               expect(firstSpyModuleObject.onEvent).toHaveBeenCalledWith(publishedEvent);
            });
         });
      });


   });

   describe('on adding a dom node with one module with a multi-instance', function() {

      var ADDED_DIV_ID = 'test-addedDiv';

      var moduleWithDependencySpy;
      var moduleWithDependencyObject;

      var dependencyPartSpy;
      var dependencyPartObject;

      beforeEach(function(done) {

         moduleWithDependencyObject = jasmine.createSpyObj('moduleWithDependencyObject', ['postConstruct']);
         dependencyPartObject = jasmine.createSpyObj('dependencyPartObject', ['postConstruct']);

         moduleWithDependencySpy = jasmine.createSpy('moduleWithDependency').and.callFake(
            function() {
               return moduleWithDependencyObject;
            }
         );

         dependencyPartSpy = jasmine.createSpy('dependencyPart').and.returnValue(dependencyPartObject);

         moduleSystem.createPart('dependency-part')
            .creator(dependencyPartSpy);

         moduleSystem.createModule('module-with-dependency')
            .dependencies(['dependency-part'])
            .creator(moduleWithDependencySpy);

         var settings = {
            domMutationSupport: true
         };

         moduleSystem.initModulePage(settings);

         var elementToAddAsTest = '<div id="' + ADDED_DIV_ID + '" modules="module-with-dependency">' +
            '</div>';

         $(elementToAddAsTest).
            appendTo($parentDiv);

         setTimeout(function() {
            done();
         }, WAIT_TIME_FOR_MUTATION_EVENT);
      }, MAX_WAIT_TIME);

      it('should call the dependency part creator creator function', function() {

         expect(dependencyPartSpy).toHaveBeenCalled();
         expect(dependencyPartSpy.calls.count()).toBe(1);
      });

      it('should call postConstruct on dependency part', function() {

         expect(dependencyPartObject.postConstruct).toHaveBeenCalled();
         expect(dependencyPartObject.postConstruct.calls.count()).toBe(1);
      });

      it('should call the added module creator function', function() {

         expect(moduleWithDependencySpy).toHaveBeenCalled();
         expect(moduleWithDependencySpy.calls.count()).toBe(1);
      });

      it('should pass the moduleObject to added moduleCreator', function() {

         expect(moduleWithDependencySpy).toHaveBeenCalledWith(jasmine.objectContaining({id:ADDED_DIV_ID}), dependencyPartObject);
      });

      it('should call postConstruct on module', function() {

         expect(moduleWithDependencyObject.postConstruct).toHaveBeenCalled();
         expect(moduleWithDependencyObject.postConstruct.calls.count()).toBe(1);
      });
   });

   describe('when id attribute has been customized', function() {

      var ADDED_DIV_ID = 'test-addedDiv';
      var ADDED_DIV_SELECTOR = '#test-addedDiv';
      var CUSTOM_ID = 'data-mom-id';

      beforeEach(function(done) {
         var settings = {
            customIdAttribute: CUSTOM_ID,
            domMutationSupport: true
         };

         moduleSystem.initModulePage(settings);

         eventBus = moduleSystem.getPart('event-bus');

         var elementToAddAsTest = '<div id="' + ADDED_DIV_ID + '" modules="test-module1"></div>';

         $(elementToAddAsTest).
            appendTo($parentDiv);

         setTimeout(function() {
            done();
         }, WAIT_TIME_FOR_MUTATION_EVENT);
      }, MAX_WAIT_TIME);

      it('should call the existing module creator function once (on page init)', function() {

         expect(existingModuleCreator).toHaveBeenCalled();
         expect(existingModuleCreator.calls.count()).toEqual(1);
      });

      it('should call the added module creator function', function() {

         expect(firstSpyModule).toHaveBeenCalled();
         expect(firstSpyModule.calls.count()).toEqual(1);
      });

      it('should pass the moduleObject to added moduleCreator', function() {

         expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:ADDED_DIV_ID}));
      });

      it('should call postConstruct on module', function() {

         expect(firstSpyModuleObject.postConstruct).toHaveBeenCalled();
         expect(firstSpyModuleObject.postConstruct.calls.count()).toEqual(1);
      });

      it('should NOT set the joj-id attribute to the dom element', function() {

         expect(ADDED_DIV_SELECTOR).not.toHaveAttr(DEFAULT_CUSTOM_ID);
      });

      it('should set the custom id attribute to the dom element', function() {

         expect(ADDED_DIV_SELECTOR).toHaveAttr(CUSTOM_ID);
      });
   });

   describe('when modules attribute has been customized', function() {

      var ADDED_DIV_ID = 'test-addedDiv';

      beforeEach(function(done) {

         var settings = {
            attribute: 'data-modules',
            domMutationSupport: true
         };

         moduleSystem.initModulePage(settings);

         var elementToAddAsTest = '<div id="' + ADDED_DIV_ID + '" data-modules="test-module1"></div>';

         $(elementToAddAsTest).
            appendTo($parentDiv);

         setTimeout(function() {
            done();
         }, WAIT_TIME_FOR_MUTATION_EVENT);
      }, MAX_WAIT_TIME);

      it('should call the added module creator function', function() {

         expect(firstSpyModule).toHaveBeenCalled();
         expect(firstSpyModule.calls.count()).toEqual(1);
      });

      it('should pass the moduleObject to added moduleCreator', function() {

         expect(firstSpyModule).toHaveBeenCalledWith(jasmine.objectContaining({id:ADDED_DIV_ID}));
      });

      it('should call postConstruct on module', function() {

         expect(firstSpyModuleObject.postConstruct).toHaveBeenCalled();
         expect(firstSpyModuleObject.postConstruct.calls.count()).toEqual(1);
      });
   });

   describe('when dom mutation support is disabled', function() {

      var ADDED_DIV_ID = 'test-addedDiv';

      beforeEach(function() {
         var settings = {
            domMutationSupport: false
         };

         moduleSystem.initModulePage(settings);

         eventBus = moduleSystem.getPart('event-bus');
      });

      describe('when div has been added to dom', function() {

         beforeEach(function() {

            var elementToAddAsTest = '<div id="' + ADDED_DIV_ID + '" modules="test-module1"></div>';

            $(elementToAddAsTest).
               appendTo($parentDiv);
         });

         it('should call the existing module creator function once (on page init)', function() {

            expect(existingModuleCreator).toHaveBeenCalled();
            expect(existingModuleCreator.calls.count()).toEqual(1);
         });

         it('should NOT call the added module creator function', function() {

            expect(firstSpyModule).not.toHaveBeenCalled();
         });
      });
   });
});
