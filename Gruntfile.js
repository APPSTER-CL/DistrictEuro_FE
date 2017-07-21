module.exports = function ( grunt ) {

  /**
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install` in this directory.
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-aws');

  /**
   * Load in our build configuration file.
   */
  var userConfig = require( './build.config.js' );

  var target = grunt.option('env') || 'dev';

  /**
   * This is the configuration object Grunt uses to give each plugin its
   * instructions.
   */
  var taskConfig = {

    /**
     * We read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON("package.json"),

    aws: grunt.file.readJSON("aws-credentials.json"),

    s3: {
      options: {
        accessKeyId: "<%= aws.accessKeyId %>",
        secretAccessKey: "<%= aws.secretAccessKey %>",
        bucket: "districteuro-" + target
      },
      build: {
        cwd: "bin/" + target,
        src: "**"
      }
    },

    /**
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner:
        '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
        ' */\n'
    },

    /**
     * Creates a changelog on a new version.
     */
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        template: 'changelog.tpl'
      }
    },

    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          "package.json",
          "bower.json"
        ],
        commit: false,
        commitMessage: 'chore(release): v%VERSION%',
        commitFiles: [
          "package.json",
          "client/bower.json"
        ],
        createTag: false,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    },

    /**
     * The directories to delete when `grunt clean` is executed.
     */
    clean: {
      dev: [
        '<%= build_dir %>/dev',
        '<%= compile_dir %>/dev'
      ],
      test: [
        '<%= build_dir %>/test',
        '<%= compile_dir %>/test'
      ],
      demo: [
        '<%= build_dir %>/demo',
        '<%= compile_dir %>/demo'
      ],
      prod: [
        '<%= build_dir %>/prod',
        '<%= compile_dir %>/prod'
      ]
    },

    replace: {
      dev: {
        options: {
          patterns: [
            {
              match: /{ENV}/g,
              replacement: 'dev'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['app/configuration.js'], dest: '<%= build_dir %>/dev/app'}
        ]
      },
      test: {
        options: {
          patterns: [
            {
              match: /{ENV}/g,
              replacement: 'test'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['app/configuration.js'], dest: '<%= build_dir %>/test/app'}
        ]
      },
      demo: {
        options: {
          patterns: [
            {
              match: /{ENV}/g,
              replacement: 'demo'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['app/configuration.js'], dest: '<%= build_dir %>/demo/app'}
        ]
      },
      prod: {
        options: {
          patterns: [
            {
              match: /{ENV}/g,
              replacement: 'prod'
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['app/configuration.js'], dest: '<%= build_dir %>/prod/app'}
        ]
      }
    },

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      build_app_assets_dev: {
        files: [
          {
            src: [ '**', '!**/*.css' ],
            dest: '<%= build_dir %>/dev/assets/',
            cwd: 'assets',
            expand: true
          }
        ]
      },
      build_app_assets_test: {
        files: [
          {
            src: [ '**', '!**/*.css' ],
            dest: '<%= build_dir %>/test/assets/',
            cwd: 'assets',
            expand: true
          }
        ]
      },
      build_app_assets_demo: {
        files: [
          {
            src: [ '**', '!**/*.css' ],
            dest: '<%= build_dir %>/demo/assets/',
            cwd: 'assets',
            expand: true
          }
        ]
      },
      build_app_assets_prod: {
        files: [
          {
            src: [ '**', '!**/*.css' ],
            dest: '<%= build_dir %>/prod/assets/',
            cwd: 'assets',
            expand: true
          }
        ]
      },
      build_vendor_assets_dev: {
        files: [
          {
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/dev/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      build_vendor_assets_test: {
        files: [
          {
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/test/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      build_vendor_assets_demo: {
        files: [
          {
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/demo/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      build_vendor_assets_prod: {
        files: [
          {
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/prod/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      build_appjs_dev: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            dest: '<%= build_dir %>/dev/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_appjs_test: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            dest: '<%= build_dir %>/test/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_appjs_demo: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            dest: '<%= build_dir %>/demo/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_appjs_prod: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            dest: '<%= build_dir %>/prod/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs_dev: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/dev/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs_test: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/test/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs_demo: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/demo/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs_prod: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/prod/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorcss_dev: {
        files: [
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= build_dir %>/dev/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorcss_test: {
        files: [
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= build_dir %>/test/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorcss_demo: {
        files: [
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= build_dir %>/demo/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorcss_prod: {
        files: [
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= build_dir %>/prod/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compile_assets_dev: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/dev/assets',
            cwd: '<%= build_dir %>/dev/assets',
            expand: true
          },
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= compile_dir %>/dev/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compile_assets_test: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/test/assets',
            cwd: '<%= build_dir %>/test/assets',
            expand: true
          },
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= compile_dir %>/test/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compile_assets_demo: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/demo/assets',
            cwd: '<%= build_dir %>/demo/assets',
            expand: true
          },
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= compile_dir %>/demo/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compile_assets_prod: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/prod/assets',
            cwd: '<%= build_dir %>/prod/assets',
            expand: true
          },
          {
            src: [ '<%= vendor_files.css %>' ],
            dest: '<%= compile_dir %>/prod/',
            cwd: '.',
            expand: true
          }
        ]
      }
    },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `build_css` target concatenates compiled CSS and vendor CSS
       * together.
       */
      build_css_dev: {
        src: [
          'assets/css/*.css',
          '<%= vendor_files.css %>'
        ],
        dest: '<%= build_dir %>/dev/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      build_css_test: {
        src: [
          'assets/css/*.css',
          '<%= vendor_files.css %>'
        ],
        dest: '<%= build_dir %>/test/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      build_css_demo: {
        src: [
          'assets/css/*.css',
          '<%= vendor_files.css %>'
        ],
        dest: '<%= build_dir %>/demo/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      build_css_prod: {
        src: [
          'assets/css/*.css',
          '<%= vendor_files.css %>'
        ],
        dest: '<%= build_dir %>/prod/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      /**
       * The `compile_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compile_js_dev: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/dev/app/**/*.js',
          '<%= html2js.dev.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/dev/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      compile_js_test: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/test/app/**/*.js',
          '<%= html2js.test.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/test/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      compile_js_demo: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/demo/app/**/*.js',
          '<%= html2js.demo.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/demo/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      compile_js_prod: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/prod/app/**/*.js',
          '<%= html2js.prod.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/prod/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    /**
     * `ngAnnotate` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngAnnotate: {
      compile: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            cwd: '<%= build_dir %>/' + target,
            dest: '<%= build_dir %>/' + target,
            expand: true
          }
        ]
      }
    },

    /**
     * Minify the sources!
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          '<%= concat.compile_js_dev.dest %>': '<%= concat.compile_js_dev.dest %>',
          '<%= concat.compile_js_test.dest %>': '<%= concat.compile_js_test.dest %>',
          '<%= concat.compile_js_demo.dest %>': '<%= concat.compile_js_demo.dest %>',
          '<%= concat.compile_js_prod.dest %>': '<%= concat.compile_js_prod.dest %>'
        }
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      app: [
        '<%= app_files.js %>'
      ],
      test: [
        '<%= app_files.jsunit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      dev: {
        options: {
          module: 'templates-app',
          rename: function (moduleName) {
            return moduleName.replace('../app/components/', '');
          }
        },
        src: [ '<%= app_files.atpl %>', '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/dev/templates-app.js'
      },
      test: {
        options: {
          module: 'templates-app',
          rename: function (moduleName) {
            return moduleName.replace('../app/components/', '');
          }
        },
        src: [ '<%= app_files.atpl %>', '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/test/templates-app.js'
      },
      demo: {
        options: {
          module: 'templates-app',
          rename: function (moduleName) {
            return moduleName.replace('../app/components/', '');
          }
        },
        src: [ '<%= app_files.atpl %>', '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/demo/templates-app.js'
      },
      prod: {
        options: {
          module: 'templates-app',
          rename: function (moduleName) {
            return moduleName.replace('../app/components/', '');
          }
        },
        src: [ '<%= app_files.atpl %>', '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/prod/templates-app.js'
      }
    },

    /**
     * The Karma configurations.
     */
    karma: {
      options: {
        configFile: '<%= build_dir %>/dev/karma-unit.js',
        browsers: ['Chrome']
      },
      unit: {
        background: true,
        singleRun: false
      },
      continuous: {
        singleRun: true
      }
    },

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build_dev: {
        dir: '<%= build_dir %>/dev',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/dev/app/**/*.js',
          '<%= html2js.dev.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/dev/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },
      build_test: {
        dir: '<%= build_dir %>/test',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/test/app/**/*.js',
          '<%= html2js.test.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/test/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },
      build_demo: {
        dir: '<%= build_dir %>/demo',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/demo/app/**/*.js',
          '<%= html2js.demo.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/demo/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },
      build_prod: {
        dir: '<%= build_dir %>/prod',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/prod/app/**/*.js',
          '<%= html2js.prod.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/prod/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile_dev: {
        dir: '<%= compile_dir %>/dev',
        src: [
          '<%= concat.compile_js_dev.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/dev/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },
      compile_test: {
        dir: '<%= compile_dir %>/test',
        src: [
          '<%= concat.compile_js_test.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/test/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },
      compile_demo: {
        dir: '<%= compile_dir %>/demo',
        src: [
          '<%= concat.compile_js_demo.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/demo/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },
      compile_prod: {
        dir: '<%= compile_dir %>/prod',
        src: [
          '<%= concat.compile_js_prod.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/prod/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      }
    },

    /**
     * This task compiles the karma template so that changes to its file array
     * don't have to be managed manually.
     */
    karmaconfig: {
      unit: {
        dir: '<%= build_dir %>/dev',
        src: [
          '<%= vendor_files.js %>',
          '<%= html2js.dev.dest %>',
          '<%= html2js.test.dest %>',
          '<%= html2js.demo.dest %>',
          '<%= html2js.prod.dest %>',
          '<%= test_files.js %>'
        ]
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
          src: [
            '<%= build_dir %>/dev/**/*'
          ]
        },
        options: {
          watchTask: true,
          watchOptions: {
              ignored: ''
          },
          server: {
            baseDir: '<%= build_dir %>/dev'
          }
        }
      },
      test: {
        bsFiles: {
          src: [
            '<%= build_dir %>/test/**/*'
          ]
        },
        options: {
          watchTask: true,
          watchOptions: {
              ignored: ''
          },
          server: {
            baseDir: '<%= build_dir %>/test'
          }
        }
      },
      demo: {
        bsFiles: {
          src: [
            '<%= build_dir %>/demo/**/*'
          ]
        },
        options: {
          watchTask: true,
          watchOptions: {
              ignored: ''
          },
          server: {
            baseDir: '<%= build_dir %>/demo'
          }
        }
      },
      prod: {
        bsFiles: {
          src: [
            '<%= build_dir %>/prod/**/*'
          ]
        },
        options: {
          watchTask: true,
          watchOptions: {
              ignored: ''
          },
          server: {
            baseDir: '<%= build_dir %>/prod'
          }
        }
      }
    },

    /**
    * And for rapid development, we have a watch set up that checks to see if
    * any of the files listed below change, and then to execute the listed
    * tasks when they do. This just saves us from having to type "grunt" into
    * the command-line every time we want to see what we're working on; we can
    * instead just leave "grunt watch" running in a background terminal. Set it
    * and forget it, as Ron Popeil used to tell us.
    *
    * But we don't need the same thing to happen for all the files.
    */
    watch: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: false
      },

      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ]
      },

      /**
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      jssrc: {
        files: [
          '<%= app_files.js %>'
        ],
        tasks: [ 'jshint:app', 'karma:unit', 'copy:build_appjs_' + target, 'replace:' + target ]
      },

      /**
       * When assets are changed, copy them. Note that this will *not* copy new
       * files, so this is probably not very useful.
       */
      assets: {
        files: [
          'assets/**/*'
        ],
        tasks: [ 'copy:build_app_assets_' + target, 'copy:build_vendor_assets_' + target, 'concat:build_css_' + target ]
      },

      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: [ '<%= app_files.html %>' ],
        tasks: [ 'index:build_' + target ]
      },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: [
          '<%= app_files.atpl %>',
          '<%= app_files.ctpl %>'
        ],
        tasks: [ 'html2js:' + target ]
      },

      /**
       * When a JavaScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      jsunit: {
        files: [
          '<%= app_files.jsunit %>'
        ],
        tasks: [ 'jshint:test', 'karma:unit' ]
       }
     }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.registerTask( 'serve', [ 'build', 'browserSync:' + target, 'karma:unit', 'watch' ] );

  /**
   * The default task is to build and compile.
   */
  grunt.registerTask( 'default', [ 'build', 'compile' ] );

  /**
   * The `build` task gets your app ready to run for development and testing.
   */
  grunt.registerTask( 'build', [
    'clean:' + target, 'html2js:' + target, 'jshint',
    'concat:build_css_' + target, 'copy:build_app_assets_' + target, 'copy:build_vendor_assets_' + target,
    'copy:build_appjs_' + target, 'copy:build_vendorjs_' + target, 'copy:build_vendorcss_' + target, 'replace:' + target,
    'index:build_' + target, 'karmaconfig', 'karma:continuous'
  ]);

  /**
   * The `compile` task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  grunt.registerTask( 'compile', [
    'copy:compile_assets_' + target, 'ngAnnotate', 'concat:compile_js_' + target, 'uglify', 'index:compile_' + target
  ]);

  /**
   * The `deploy` task gets your app and deploy it to Amazon S3
   */
  grunt.registerTask( 'deploy', [
    'build', 'compile', 's3'
  ]);

  /**
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {
    var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/'+ target + '\/', 'g' );
    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });
    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });

    grunt.file.copy('app/index.html', this.data.dir + '/index.html', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' )
          }
        });
      }
    });
  });

  /**
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
    var jsFiles = filterForJS( this.filesSrc );

    grunt.file.copy( 'karma/karma-unit.tpl.js', grunt.config( 'build_dir' ) + '/' + target + '/karma-unit.js', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles
          }
        });
      }
    });
  });
};
