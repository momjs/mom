describe('Module builder', function() {

   var builder;
   var moduleAccessSpy;

   beforeEach(function() {

      moduleAccessSpy = {};
      builder = moduleSystem.createModule('myModule');
   });

   describe('on invalid settings', function() {

      it('should throw when passing settings as string', function() {

         expect(function() {
            builder.settings('invalid settings');
         }).toThrowError("You have to pass the settings as an object.");
      });

      it('should throw when passing settings as integer number', function() {

         expect(function() {
            builder.settings(123);
         }).toThrowError("You have to pass the settings as an object.");
      });

      it('should throw when passing settings as floating number', function() {

         expect(function() {
            builder.settings(123.4);
         }).toThrowError("You have to pass the settings as an object.");
      });

      it('should throw when passing settings as boolean', function() {

         expect(function() {
            builder.settings(true);
         }).toThrowError("You have to pass the settings as an object.");
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
});
