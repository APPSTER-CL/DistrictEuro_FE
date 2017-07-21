## Quick Start

Install Node.js and then:

```sh
$ git clone https://USERNAME@bitbucket.org/asapuy/kate_district_euro_frontend.git
$ sudo npm -g install grunt-cli karma bower
$ npm install
$ bower install
$ grunt watch
```
## Building, compiling, running and deploying.

The solution manage four different environments:
- dev: development
- test: testing
- demo: demo
- prod: production
The last three are environments that could be deployed to Amazon AWS, the first one
is just a local environment. If the environment is not specify then by default it will
be set to dev.

## Building

If you want to build the demo environment then you should run this:

```sh
$ grunt build --env=demo
```

This will create a build/demo path in the solution folder with all the files needed
for the demo environment.

## Running

If you want to run the development environment then you should run this:

```sh
$ grunt serve --env=dev
```

OR

```sh
$ grunt serve
```

This will create a build/dev path in the solution folder with all the files needed
for the development environment and start a browser sync instance to launch the site.
All changes on css, html or js files will trigger an update that will refresh the
site automatically.

## Compiling

If you want to compile the test environment then you should run this:

```sh
$ grunt compile --env=test
```

This will create a bin/test path in the solution folder with all the files from the
build/test folder ready to deploy (concatenated, minified, etc).

## Deploy

If you want to deploy the production environment then you should run this:

```sh
$ grunt deploy --env=prod
```

This will build, compile and deploy the solution for the production environment to AWS S3.
For this you only need to have the aws-credentials.json on the root of your solution folder,
this file is not in the repository for security reasons.

## Purpose

### Overall Directory Structure

At a high level, the structure looks roughly like this:

```
DistrictEuro/
  |- app/
  |  |- components/
  |  |  |- <app logic>
  |  |- shared/
  |  |  |- <reusable code>
  |- assets/
  |  |- <static files>
  |- karma/
  |- libs/
  |  |- angular-bootstrap/
  |  |- bootstrap/
  |  |- placeholders/
  |- node-modules/
  |  |- <node modules>
  |- .bowerrc
  |- .gitignore
  |- aws-credentials.json
  |- bower.json
  |- build.config.js
  |- Gruntfile.js
  |- module.prefix
  |- module.suffix
  |- package.json
```

What follows is a brief description of each entry, but most directories contain
their own `README.md` file with additional documentation, so browse around to
learn more.

- `karma/` - test configuration.
- `app/` - our application sources. [Read more &raquo;](app/README.md)
- `libs/` - third-party libraries. [Bower](http://bower.io) will install
  packages here. Anything added to this directory will need to be manually added
  to `build.config.js` and `karma/karma-unit.js` to be picked up by the build
  system.
- `.bowerrc` - the Bower configuration file. This tells Bower to install
  components into the `libs/` directory.
- `aws-credentials.json` - This file contains the KEYS to access the AWS account.
  For security reasons is not included in the repository but is needed for deploying
  the solution to AWS using Grunt.
- `bower.json` - this is our project configuration for Bower and it contains the
  list of Bower dependencies we need.
- `build.config.js` - our customizable build settings; see "The Build System"
  below.
- `Gruntfile.js` - our build script; see "The Build System" below.
- `module.prefix` and `module.suffix` - our compiled application script is
  wrapped in these, which by default are used to place the application inside a
  self-executing anonymous function to ensure no clashes with other libraries.
- `package.json` - metadata about the app, used by NPM and our build script. Our
  NPM dependencies are listed here.
