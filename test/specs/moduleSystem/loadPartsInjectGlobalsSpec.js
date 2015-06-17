describe('Loaded part inject globals', function() {

  myGlobal = {
    description : 'this is my global object'
  };

  var moduleCreator;

  beforeEach(function() {
    loadFixtures('moduleSystem/oneModule.html');

    moduleCreator = jasmine.createSpy('moduleCreator');
  });

  describe('when module demands an existing global', function() {

    beforeEach(function() {
      mom.createModule('test-module').dependencies(['myGlobal']).creator(moduleCreator);

      mom.initModulePage();
    });

    it('should call module creator (generally)', function() {

      expect(moduleCreator).toHaveBeenCalled();
      expect(moduleCreator.calls.count()).toBe(1);
    });

    it('should inject global as second parameter', function() {

      var secondParameter = moduleCreator.calls.mostRecent().args[1];
      expect(secondParameter).toBe(myGlobal);
    });
  });

  describe('when module demands an existing global which conflicts with an registered part', function() {

    var partObject;

    beforeEach(function() {
      mom = mom.newInstance();

      partObject = {
        description : 'this is the part object returned by the part creator'
      };

      mom.createPart('myGlobal').returns(partObject);
      mom.createModule('test-module').dependencies(['myGlobal']).creator(moduleCreator);

      mom.initModulePage();
    });

    it('should call module creator (generally)', function() {

      expect(moduleCreator).toHaveBeenCalled();
      expect(moduleCreator.calls.count()).toBe(1);
    });

    it('should inject part Object as second parameter', function() {

      var secondParameter = moduleCreator.calls.mostRecent().args[1];
      expect(secondParameter).toBe(partObject);
    });
  });

  describe('when module demands a NOT existing global', function() {

    beforeEach(function() {

      mom.createModule('test-module').dependencies(['myNotExistingGlobal']).creator(moduleCreator);
    });

    it('should NOT call module creator (generally)', function() {

      try{
        mom.initModulePage();
      }
      catch(e) {}

      expect(moduleCreator).not.toHaveBeenCalled();
    });

    it('should throw error', function() {

      expect(mom.initModulePage).toThrowError('tried to load myNotExistingGlobal but was not registered');

      expect(moduleCreator).not.toHaveBeenCalled();
    });
  });
});
