/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `app/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`app/shared`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `less` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'app/**/*.js',
          '!app/**/*.spec.js',
          '!app/assets/**/*.js'],
    jsunit: [ 'app/**/*.spec.js' ],

    atpl: [ 'app/components/**/*.tpl.html' ],
    ctpl: [ 'app/shared/**/*.tpl.html' ],

    html: [ 'app/index.html' ],
    css: [ 'assets/css/*.css' ]
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'libs/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`libs/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [
      'libs/jquery/dist/jquery.min.js',
      'libs/bootstrap/dist/js/bootstrap.min.js',
      'libs/angular/angular.js',
      'libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'libs/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
      'libs/angular-ui-router/release/angular-ui-router.js',
      'libs/angular-ui-utils/modules/route/route.js',
      'libs/ng-table/dist/ng-table.min.js',
      'libs/angular-simple-storage/dist/angular-simpleStorage.min.js',
      'libs/angular-flash-alert/src/angular-flash.js',
      'libs/angular-material/angular-material.js',
      'libs/angular-animate/angular-animate.js',
      'libs/angular-aria/angular-aria.js',
      'libs/angular-translate/angular-translate.js',
      'libs/angular-translate-loader-url/angular-translate-loader-url.min.js',
      'libs/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
      'libs/angular-cookies/angular-cookies.min.js',
      'libs/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
      'libs/angular-translate-storage-local/angular-translate-storage-local.min.js',
      'libs/angular-file-upload/dist/angular-file-upload.min.js',
      'libs/angular-loading-bar/src/loading-bar.js',
      'assets/js/Chart.min.js',
      'assets/js/angular-chart.min.js'
    ],
    css: [
      'libs/ng-table/dist/ng-table.min.css',
      'libs/angular-flash-alert/src/angular-flash.css',
      'libs/angular-material/angular-material.css',
      'libs/angular-loading-bar/src/loading-bar.css'
    ],
    assets: [
    ]
  },
};
