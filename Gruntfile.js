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
         test: 'spec'
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
                    '<%= dirs.source %>/moduleLoader/moduleLoader.js',
                    '<%= dirs.source %>/moduleLoader/moduleBuilder.js',
                    '<%= dirs.source %>/moduleLoader/partAccess.js',
                    '<%= dirs.source %>/moduleLoader/moduleAccess.js',
                    '<%= dirs.source %>/eventBus/eventBus.js',
                    '<%= dirs.source %>/moduleLoader/moduleSystem.js'
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
         coverage: {
            src: '<%= concat.dist.src %>',
            options: {
               vendor: [
                        '<%= dirs.dep %>/jquery.js',
                        '<%= dirs.dep %>/jasmine-jquery.js'
                    ],
               specs: [
                        '<%= dirs.test %>/**/*Spec.js'
                    ]
            }
         }
      },
      bump: {
         options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: ['pkg'],
            commit: true,
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['-a'],
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: true,
            pushTo: 'origin',
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
         }
      },
      exec: {
         gitAddAll: 'git add --all'
      }
   });

   // Load the plugin that provides the "jshint" task.
   grunt.loadNpmTasks('grunt-contrib-jshint');

   // Load the plugin that provides the "concat" task.
   grunt.loadNpmTasks('grunt-contrib-concat');

   // Load the plugin that provides the "uglify" task.
   grunt.loadNpmTasks('grunt-contrib-uglify');

   grunt.loadNpmTasks('grunt-contrib-jasmine');

   grunt.loadNpmTasks('grunt-bower-task');

   grunt.renameTask('bower', 'bowerInstall');

   grunt.loadNpmTasks('grunt-bower');

   grunt.loadNpmTasks('grunt-bump');

   grunt.loadNpmTasks('grunt-exec');

   // Default task.
   grunt.registerTask('default', ['build']);

   grunt.registerTask('releaseMinor', ['bump-only', 'build', 'exec', 'bump-commit'])

   // Build task.
   grunt.registerTask('build', ['bowerInstall', 'bower', 'jasmine', 'jshint', 'concat', 'uglify']);

   grunt.registerTask('test', ['jasmine']);

   grunt.registerTask('createSpecRunner', [
        'jasmine:coverage:build'
    ]);
};