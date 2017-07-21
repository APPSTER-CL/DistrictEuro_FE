# The `app/shared/` Directory

The `app/shared/` directory houses internal and third-party re-usable
components. Essentially, this folder is for everything that isn't completely
specific to this application.

Each component resides in its own directory that may then be structured any way
the developer desires. The build system will read all `*.js` files that do not
end in `.spec.js` as source files to be included in the final build, all
`*.spec.js` files as unit tests to be executed, and all `*.tpl.html` files as
templates to compiled into the `$templateCache`. There is currently no way to
handle components that do not meet this pattern.
