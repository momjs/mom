describe("The Module Loader", function() {

    beforeEach(function() {
        moduleSystem.modules = {};
        moduleSystem.parts = {};
    });

    afterEach(function() {
        eventBus.remove("testModule0");
        eventBus.remove("testModule1");
        moduleSystem.modules = {};
        moduleSystem.parts = {};
    });

    it("should load any Module found in dom", function() {
        loadFixtures("moduleSystem/oneModule.html");
        var spyModule = jasmine.createSpy("creator");
        moduleSystem.createModule("testModule").creator(spyModule);

        moduleSystem.initModulePage();

        expect(spyModule).toHaveBeenCalled();
        expect(spyModule.calls.argsFor(0)[0]).toEqual($("#test-testModule"))
    });

    it("should load comma separated module list", function() {
        loadFixtures("moduleSystem/commaSeparateModules.html");
        var spyModule1 = jasmine.createSpy("creator");
        moduleSystem.createModule("testModule1").creator(spyModule1);
        var spyModule2 = jasmine.createSpy("creator");
        moduleSystem.createModule("testModule2").creator(spyModule2);

        moduleSystem.initModulePage();

        expect(spyModule1).toHaveBeenCalled();
        expect(spyModule1.calls.argsFor(0)[0]).toEqual($("#test-testModule"));
        expect(spyModule2).toHaveBeenCalled();
        expect(spyModule2.calls.argsFor(0)[0]).toEqual($("#test-testModule"));
    });

    it("should not load a Module if not found in dom", function() {
        var spyModule = jasmine.createSpy("creator");
        moduleSystem.createModule("testModule").creator(spyModule);

        moduleSystem.initModulePage();

        expect(spyModule).not.toHaveBeenCalled();
    });

    it("should provide a settings object to the module if specified", function() {
        loadFixtures("moduleSystem/oneModule.html");
        var settings = {
            testSetting: "test"
        };

        var spyModule = jasmine.createSpy("creator").and.returnValue({});
        moduleSystem.createModule("testModule")
            .settings(settings)
            .creator(spyModule);

        moduleSystem.initModulePage();

        expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), settings);

    });

    it("should provide a settings object to the module if settings found in DOM", function() {
        loadFixtures("moduleSystem/oneModuleWithSettings.html");

        var spyModule = jasmine.createSpy("creator").and.returnValue({});
        moduleSystem.createModule("testModule")
            .creator(spyModule);

        moduleSystem.initModulePage();

        expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), {
            testOverrideSetting: 12
        });

    });


    it("should override the specified settings with the settings found in DOM", function() {
        loadFixtures("moduleSystem/oneModuleWithSettings.html");
        var settings = {
            testOverrideSetting: "test",
            otherSetting: "setting"
        };

        var spyModule = jasmine.createSpy("creator").and.returnValue({});
        moduleSystem.createModule("testModule")
            .settings(settings)
            .creator(spyModule);

        moduleSystem.initModulePage();

        expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), {
            testOverrideSetting: 12,
            otherSetting: settings.otherSetting
        });

    });


    it("should set the name of a module to its moduleObj", function() {
        loadFixtures("moduleSystem/oneModule.html");
        var moduleObj = {};
        var spyModule = jasmine.createSpy("creator").and.returnValue(moduleObj);
        moduleSystem.createModule("testModule").creator(spyModule);

        moduleSystem.initModulePage();

        expect(moduleObj.name).toBe("testModule0");
    });



    it("should create a module for every module in dom", function() {
        loadFixtures("moduleSystem/twoIdenticalModules.html");
        var spyModule = jasmine.createSpy("creator");
        moduleSystem.createModule("testModule").creator(spyModule);

        moduleSystem.initModulePage();

        expect(spyModule.calls.count()).toBe(2);
        expect(spyModule.calls.argsFor(0)[0]).toEqual($("#test-testModule1"));
        expect(spyModule.calls.argsFor(1)[0]).toEqual($("#test-testModule2"));
    });

    it("should set incrementing name of a module to its moduleObj", function() {
        loadFixtures("moduleSystem/twoIdenticalModules.html");
        var moduleObj = {};
        var spyModule = jasmine.createSpy("creator").and.returnValue(moduleObj);
        moduleSystem.createModule("testModule").creator(spyModule);

        moduleSystem.initModulePage();

        expect(moduleObj.name).toBe("testModule1");
    });




    it("should Throw if a Module in the dom is not registered", function() {
        loadFixtures("moduleSystem/oneModule.html");

        expect(moduleSystem.initModulePage).toThrow();
    });


    it("should load any Part", function() {
        var spyPart = jasmine.createSpy("creator");
        moduleSystem.createPart("testPart").creator(spyPart);

        moduleSystem.initModulePage();

        expect(spyPart).toHaveBeenCalled();
    });

    it("should provide a settings object to the part if specified", function() {
        var settings = {
            testSetting: "test"
        };

        var spyPart = jasmine.createSpy("creator").and.returnValue({});
        moduleSystem.createPart("testPart")
            .settings(settings)
            .creator(spyPart);

        moduleSystem.initModulePage();

        expect(spyPart).toHaveBeenCalledWith(settings);

    });

    it("should add missing Parts to Parts", function() {
        var testPart = jasmine.createSpy();
        var publicMethodObject = {
            testProperty: "test"
        };
        moduleSystem.createPart("dependencyPart").creator(function() {
            return publicMethodObject;
        });
        moduleSystem.createPart("testPart").dependencies(["dependencyPart"]).creator(testPart);

        moduleSystem.initModulePage();


        expect(testPart).toHaveBeenCalledWith(publicMethodObject);
    });

    it("should add missing parts to the module", function() {
        loadFixtures("moduleSystem/oneModule.html");
        var spyModule = jasmine.createSpy();
        var publicMethodObject = {
            testProperty: "test"
        };
        moduleSystem.createPart("testPart").creator(function() {
            return publicMethodObject;
        });
        moduleSystem.createModule("testModule").dependencies(["testPart"]).creator(spyModule);

        moduleSystem.initModulePage();


        expect(spyModule).toHaveBeenCalledWith(jasmine.any(Object), publicMethodObject);
    });


    it("should throw an exception if a part dependencie couldn't be resolved", function() {
        var spyPart = jasmine.createSpy();
        moduleSystem.createPart("testPart").dependencies(["dependencyPart"]).creator(spyPart);

        expect(moduleSystem.initModulePage).toThrow();
    });


    it("should throw an exception on circular dependencies", function() {
        var spyPart = jasmine.createSpy();
        moduleSystem.createPart("testPart").dependencies(["dependencyPart"]).creator(spyPart);
        moduleSystem.createPart("dependencyPart").dependencies(["testPart"]).creator(spyPart);

        expect(moduleSystem.initModulePage).toThrow();
    });

    it("should throw an exception if a module dependencie couldn't be resolved", function() {
        loadFixtures("moduleSystem/oneModule.html");
        var spyModule = jasmine.createSpy();
        moduleSystem.createModule("testModule").dependencies(["dependencyPart"]).creator(spyModule);

        expect(moduleSystem.initModulePage).toThrow();
    });




    it("should add every model to the event bus", function() {
        loadFixtures("moduleSystem/oneModule.html");
        eventBus.add = jasmine.createSpy("add").and.callThrough();

        var publicMethodObject = {
            testProperty: "test"
        };
        moduleSystem.createModule("testModule").creator(function() {
            return publicMethodObject;
        });


        moduleSystem.initModulePage();


        expect(eventBus.add).toHaveBeenCalledWith({
            name: "testModule0",
            testProperty: "test"
        });
    });

    it("should call postConstruct when provision is finished", function() {
        loadFixtures("moduleSystem/oneModule.html");
        var spyModuleObject = jasmine.createSpyObj("module object", ["postConstruct"]);
        var initWasCalled = false;

        spyModuleObject.postConstruct.and.callFake(function() {
            expect(initWasCalled).toEqual(true);
        });

        var spyModule = jasmine.createSpy("spyModule").and.callFake(function() {
            initWasCalled = true;
            return spyModuleObject;
        });


        moduleSystem.createModule("testModule").creator(spyModule);


        moduleSystem.initModulePage();


        expect(spyModuleObject.postConstruct).toHaveBeenCalled();
    });



});