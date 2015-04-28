/* global module: true */
module.exports = function (grunt) {
   'use strict';

   // Project configuration.
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      meta: {
         banner: [
                '/**',
                ' * <%= pkg.name %>',
                ' * <%= pkg.description %>',
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>' +
                ' * @link <%= pkg.homepage %>',
                ' * @author <%= pkg.author %>',
                ' * @license MIT License, http://www.opensource.org/licenses/MIT',
                ' */'
            ].join('\n')
      },
      dirs: {
         dest: 'dist',
         dep: '<%= dirs.dest %>/dependencies',
         source: 'src',
         test: 'test'
      },
      files: {
         src: [
               '<%= dirs.source %>/utils/settingsUtils.js',
               '<%= dirs.source %>/utils/arrayUtils.js',
               '<%= dirs.source %>/utils/logUtils.js',
               '<%= dirs.source %>/utils/objectUtils.js',
               '<%= dirs.source %>/utils/functionUtils.js',
               '<%= dirs.source %>/utils/stringUtils.js',
               '<%= dirs.source %>/utils/htmlElementUtils.js',
               '<%= dirs.source %>/moduleSystem/constants.js',
               '<%= dirs.source %>/moduleSystem/descriptorCreators.js',
               '<%= dirs.source %>/moduleSystem/settings.js',
               '<%= dirs.source %>/moduleSystem/modules/moduleLoader.js',
               '<%= dirs.source %>/moduleSystem/modules/moduleBuilder.js',
               '<%= dirs.source %>/moduleSystem/modules/loadedModulesContainer.js',
               '<%= dirs.source %>/moduleSystem/modules/modules.js',
               '<%= dirs.source %>/moduleSystem/modules/domEventListener.js',
               '<%= dirs.source %>/moduleSystem/parts/partBuilder.js',
               '<%= dirs.source %>/moduleSystem/parts/parts.js',
               '<%= dirs.source %>/eventBus/eventBus.js',
               '<%= dirs.source %>/moduleSystem/moduleSystem.js']
      },
      bower: {
         dev: {
            dest: '<%= dirs.dep %>'
         }
      },
      concat: {
         options: {
            banner: '<%= meta.banner %>'
         },
         dist: {
            src: [
               '<%= dirs.source %>/intro.js',
               '<%= files.src %>',
               '<%= dirs.source %>/outro.js'
            ],
            dest: '<%= dirs.dest %>/<%= pkg.name %>.<%= pkg.version %>.js'
         }
      },
      bowerInstall: {
         install: {}
      },
      uglify: {
         options: {
            banner: '<%= meta.banner %>'
         },
         dist: {
            src: ['<%= concat.dist.dest %>'],
            dest: '<%= dirs.dest %>/<%= pkg.name %>.<%= pkg.version %>.min.js'
         }
      },
      jshint: {
         files: ['<%= dirs.source %>/**/*.js'],
         options: {
            jshintrc: true
         }
      },
      jasmine: {
         options: {
            vendor: [
               '<%= dirs.dep %>/dist/jquery.js',
               '<%= dirs.dep %>/jasmine-jsreporter.js',
               '<%= dirs.dep %>/lib/jasmine-jquery.js'
            ],
            helpers: ['<%= dirs.test %>/helpers/**/*.js'],
            specs: [
               '<%= dirs.test %>/specs/**/*Spec.js'
            ]
         },
         test: {
            src: '<%= files.src %>',
            options: '<%= jasmine.options %>'
         },
         prod: {
            src: '<%= concat.dist.dest %>',
            options: '<%= jasmine.options %>'
         },
         prodMin: {
            src: '<%= uglify.dist.dest %>',
            options: '<%= jasmine.options %>'
         }
      },
      copy: {
         release: {
            src: '<%= concat.dist.dest %>',
            dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
         },
         releaseMin: {
            src: '<%= uglify.dist.dest %>',
            dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
         }
      },
      'saucelabs-jasmine': {
         all: {
            options: {
               username: 'alexan',
               urls: ['http://127.0.0.1:<%= connect.server.options.port %>/_SpecRunner.html'],
               build: (process.env.TRAVIS_BUILD_NUMBER) ? process.env.TRAVIS_BUILD_NUMBER : undefined,
               testname: (process.env.TRAVIS_BRANCH) ? process.env.TRAVIS_BRANCH : 'manual test',
               browsers: [{
                  browserName: 'chrome'
               }, {
                  browserName: 'firefox'
               }, {
                  browserName: 'safari',
                  version: '8'
               }, {
                  browserName: 'safari',
                  version: '7'
               }, {
                  browserName: 'safari',
                  version: '6'
               }, {
                  browserName: 'safari',
                  version: '5'
               }, {
                  browserName: 'internet explorer',
                  version: '11'
               }, {
                  browserName: 'internet explorer',
                  version: '10'
               }, {
                  browserName: 'internet explorer',
                  version: '9'
               }, {
                  browserName: 'internet explorer',
                  version: '8'
               }]
            }
         }
      },
      connect: {
         server: {
            options: {
               port: '8080',
               base: '.'
            }
         }
      }

   });

   grunt.loadNpmTasks('grunt-contrib-connect');

   grunt.loadNpmTasks('grunt-contrib-jshint');

   grunt.loadNpmTasks('grunt-contrib-concat');

   grunt.loadNpmTasks('grunt-contrib-uglify');

   grunt.loadNpmTasks('grunt-contrib-jasmine');

   grunt.loadNpmTasks('grunt-contrib-copy');

   grunt.loadNpmTasks('grunt-bower-task');

   grunt.renameTask('bower', 'bowerInstall');

   grunt.loadNpmTasks('grunt-bower');

   grunt.loadNpmTasks('grunt-saucelabs');

   // Default task.
   grunt.registerTask('default', ['build']);


   // Build task.
   grunt.registerTask('build', ['bowerInstall', 'bower', 'jshint', 'test', 'concat', 'uglify', 'testProd', 'copy']);

   var testJobs = ['jasmine:test'];
   if (typeof process.env.SAUCE_ACCESS_KEY !== 'undefined') {
      testJobs.push('sauce');
   }

   grunt.registerTask('test', testJobs);


   grunt.registerTask('testProd', ['jasmine:prod', 'jasmine:prodMin']);

   grunt.registerTask('sauce', ['createSpecRunner', 'connect', 'saucelabs-jasmine']);

   grunt.registerTask('createSpecRunner', [
        'jasmine:test:build'
    ]);
};