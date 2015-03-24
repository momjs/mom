describe('Part builder', function() {

   var builder;

   beforeEach(function() {

      builder = moduleSystem.createPart('myPart');
   });

   describe('on invalid settings', function() {

      const EXPECTED_ERROR_MESSAGE = 'You have to pass the settings as an object';

      it('should throw when passing settings as string', function() {

         expect(function() {
            builder.settings('invalid settings');
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing settings as integer number', function() {

         expect(function() {
            builder.settings(123);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing settings as floating number', function() {

         expect(function() {
            builder.settings(123.4);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing settings as boolean', function() {

         expect(function() {
            builder.settings(true);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });
   });

   describe('on valid settings', function() {

      it('should not throw when passing undefined settings', function() {

         expect(function() {
            builder.settings();
         }).not.toThrow();
      });

      it('should not throw when passing empty settings', function() {

         expect(function() {
            builder.settings({});
         }).not.toThrow();
      });

      it('should not throw when passing non-empty settings', function() {

         expect(function() {
            builder.settings({key:'value'});
         }).not.toThrow();
      });
   });

   describe('on invalid dependencies', function() {

      const EXPECTED_ERROR_MESSAGE = 'You have to pass the dependencies as an Array';
      
      it('should throw when passing dependencies as string', function() {

         expect(function() {
            builder.dependencies('invalid dependencies');
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing dependencies as integer number', function() {

         expect(function() {
            builder.dependencies(123);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing dependencies as float number', function() {

         expect(function() {
            builder.dependencies(123.4);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing dependencies as boolean', function() {

         expect(function() {
            builder.dependencies(false);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing dependencies as object', function() {
         
         expect(function() {
            builder.dependencies({});
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });
   });

   describe('on valid dependencies', function() {

      it('should not throw when passing undefined dependencies', function() {

         expect(function() {
            builder.dependencies();
         }).not.toThrow();
      });

      it('should not throw when passing dependencies as empty array', function() {

         expect(function() {
            builder.dependencies([]);
         }).not.toThrow();
      });

      it('should not throw when passing dependencies as filled array', function() {

         expect(function() {
            builder.dependencies(['dependencies']);
         }).not.toThrow();
      });
   });

   describe('on invalid creator', function() {

      const EXPECTED_ERROR_MESSAGE = 'You have to pass the creator as a reference to a function';
      
      it('should throw when passing creator as string', function() {

         expect(function() {
            builder.creator('invalid creator');
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing creator as integer number', function() {

         expect(function() {
            builder.creator(123);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing creator as float number', function() {

         expect(function() {
            builder.creator(123.4);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing creator as boolean', function() {

         expect(function() {
            builder.creator(false);
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing creator as object', function() {

         expect(function() {
            builder.creator({key:'value'});
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });

      it('should throw when passing creator as undefined', function() {
         
         expect(function() {
            builder.creator();
         }).toThrowError(EXPECTED_ERROR_MESSAGE);
      });
   });

   describe('on valid creator', function() {

      it('should not throw when passing anonymous creator function', function() {

         expect(function() {
            builder.creator(function() {});
         }).not.toThrow();
      });

      it('should not throw when passing referenced creator function', function() {

         function myCreator() {}

         expect(function() {
            builder.creator(myCreator);
         }).not.toThrow();
      });

      it('should not throw when passing creator function as variable', function() {

         var myCreator = function() {};

         expect(function() {
            builder.creator(myCreator);
         }).not.toThrow();
      });
   });
   
   describe('on invalid scope', function() {

      const EXCEPTED_ERROR_MESSAGE = 'You have to pass the scope as one of these: lazy-singleton|eager-singleton|multi-instance';
      
      it('should throw when passing creator as invalid string', function() {

         expect(function() {
            builder.scope('invalid scope');
         }).toThrowError(EXCEPTED_ERROR_MESSAGE);
      });
      
      it('should throw when passing scope as integer number', function() {

         expect(function() {
            builder.scope(123);
         }).toThrowError(EXCEPTED_ERROR_MESSAGE);
      });
      
      it('should throw when passing scope as float number', function() {

         expect(function() {
            builder.scope(123.4);
         }).toThrowError(EXCEPTED_ERROR_MESSAGE);
      });
      
      it('should throw when passing scope as boolean', function() {

         expect(function() {
            builder.scope(true);
         }).toThrowError(EXCEPTED_ERROR_MESSAGE);
      });
      
      it('should throw when passing scope as undefined', function() {

         expect(function() {
            builder.scope();
         }).toThrowError(EXCEPTED_ERROR_MESSAGE);
      });
      
      it('should throw when passing scope as object', function() {

         expect(function() {
            builder.scope({});
         }).toThrowError(EXCEPTED_ERROR_MESSAGE);
      });
   });

   describe('on valid scope', function() {

      it('should not throw when passing scope for lazy-singleton', function() {

         expect(function() {
            builder.scope('lazy-singleton');
         }).not.toThrow();
      });

      it('should not throw when passing scope for eager-singleton', function() {

         expect(function() {
            builder.scope('eager-singleton');
         }).not.toThrow();
      });

      it('should not throw when passing scope for multi-instance', function() {

         expect(function() {
            builder.scope('multi-instance');
         }).not.toThrow();
      });
   });
});
