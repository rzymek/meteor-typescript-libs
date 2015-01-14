# Meteor TypeScript libraries

This project adds TypeScript definition files related to Meteor.  It includes **meteor.d.ts** plus many others.


## Why use TypeScript?
[TypeScript] (http://www.typescriptlang.org/) allows you to specify and enforce variable types and interfaces.  It will inform you of errors before deployment/runtime, 
often with more informative errors (e.g. a required property can't be found).  A TypeScript-aware editor, like WebStorm, will provide you with code completion and 
code help/tips, as well as real-time type-checking and error information.  TypeScript code is much more self-documenting than straight-up, uncommented JavaScript code.

TypeScript also enables you to use some of the new features in the upcoming ECMAScript 6 (a.k.a. Harmony) release that have already been finalized in the spec, such as modules, 
rest arguments, default arguments.  Finally, TypeScript allows you to leverage some features found in other languages, such as generics.

There is some time investment required to use TypeScript, and the benefits will probably outweigh the costs when a code base is large and will be refactored
many times, and/or will be worked on by multiple developers.

While TypeScript can help simplify JavaScript code in some ways by replacing previously some verbose patterns (e.g. replacing the Revealing Module Pattern with 
a TypeScript Module declaration), in general, TypeScript will NOT make JavaScript prettier (like CoffeeScript).

For further reading about TypeScript please refer to the [TypeScript Handbook](http://www.typescriptlang.org/Handbook)


## Usage

1. Add symbolic link to the definitions from within some directory within your project (e.g. "lib" or ".typescript").  The definitions can be found somewhere deep within "<project_root_dir>/.meteor/...".  The following will probably work:

        $ ln -s ../.meteor/local/build/programs/server/assets/packages/meteortypescript_typescript-libs/definitions typescript/package_defs

2. Ensure you installed the [Typescript compiler for Meteor](https://github.com/meteor-typescript/meteor-typescript-compiler) or an [IDE which can transpile code](#transpilation).
3. From the typescript files, add references.  Reference the definition files with a single line:

        /// <reference path="/lib/typescript/package_defs/all-definitions.d.ts" />  (substitute path in your project)


   Or you can reference definition files individually:
   
        /// <reference path="/lib/typescript/package_defs/meteor.d.ts" />  (substitue path in your project)
        /// <reference path="/lib/typescript/package_defs/underscore.d.ts" />
        /// <reference path="/lib/typescript/package_defs/jquery.d.ts" />

4. Be aware of differences in coding styles when using TypeScript (see below)

5. Alternatively, you can pull down the definitions from github and add the ones you like to your project: <https://github.com/meteor-typescript/meteor-typescript-libs>.

##  TypeScript/Meteor coding style

### References

Try to stay away from referencing **file.ts**, rather generate a **file.d.ts** using `tsc --reference file.ts`, and reference it in your file. Compilation will be much faster and code cleaner - it's always better to split definition from implemention.

### Templates

When specifying template helpers, events, and functions for created, rendered, and destroyed, you will need to use a "bracket notation" instead of the "dot notation":

    Template['myTemplateName'].helpers({
      foo: function () {
        return Session.get("foo");
      }
    });

    Template['myTemplateName']['rendered'] = function ( ) { ... }

That's because Typescript enforces typing and it will throw an error saying "myTemplateName" does not exist when using the dot notation.

### Accessing a Form field

Trying to read a form field value? use `(<HTMLInputElement>evt.target).value`.

### Global variables

Preface any global variable declarations with a TypeScript "declare var" statement:

    declare var NavbarHelpers;
    NavbarHelpers = {};
    NavbarHelpers.someMethod = function() {...}

### Collections

The majority of extra work required to use TypeScript with Meteor is creating and maintaining the collection interfaces.  However, doing so also provides the 
additional benefit of succinctly documenting collection schema definitions (that are actually enforced).

To define collections, you will need to create an interface representing the collection and then declare a Collection type variable with that interface type (as a generic):

    interface JobDAO {
      _id?: string;
      name: string;
      status?: string;
      queuedAt?: string;
    }

    declare var Jobs: Mongo.Collection<JobDAO>;
    Jobs = new Mongo.Collection<JobDAO>('jobs');


Finally, any TypeScript file using collections will need to contain a reference at the top pointing to the collection definitions:

    /// <reference path="../lib/typescript/package_defs/meteor.d.ts"/>
    /// <reference path="../lib/typescript/custom_defs/collections.ts"/>

### Creating definition files

Here is a guide to creating definitions: <http://www.typescriptlang.org/Handbook#writing-dts-files>

If you have lots of custom definitions for a project, you can:

- Create multiple definition files and include individual references to each definition file.
- Create one huge monolithic definition file so you only have to refer to that file.
- Create multiple definition files, and create a definition file with references to the other definitions files so that you only have to maintain one reference
for all of you custom definitions.  e.g. contents of "lib/typescript/custom_defs/custom-definitions.d.ts":

        /// <reference path='collections.ts' />
        /// <reference path='paraview_helpers.d.ts'/>
        /// <reference path='handsontable.d.ts'/>
        /// <reference path='utility_helpers.ts'/>


## Transpiling TypeScript

### Meteor plugin
One solution for transpiling typescript is to install the following meteor package [https://github.com/meteor-typescript/meteor-typescript-compiler](https://github.com/meteor-typescript/meteor-typescript-compiler)

### IDE/Editor Transpilation
WebStorm is a good TypeScript-aware editor.  It can automatically transpile your TypeScript code into JavaScript every time you save a file.  To enable this
feature in WebStorm on OSX, first install the TypeScript transpiler on your system:

    $ [sudo -H] npm install -g typescript

Then, within WebStorm, go to Preferences -> File Watchers -> "+" symbol and add TypeScript.

### Command line

Last option, is to compile code from the command line. With node and the typescript compiler installed:

    $ tsc *.ts


## Contributing

Contributions are welcome. Remember that this project is about typing meteor packages in TypeScript.

Changes to the definitions for any third party libraries (e.g. jquery.d.ts) should be made on the [DefinitelyTyped] (https://github.com/borisyankov/DefinitelyTyped)
repo.


### Creating Definitions
Here is a guide to creating definitions: <http://www.typescriptlang.org/Handbook#writing-dts-files>


### Creating meteor.d.ts and its related files

All definition files are generated by executing a file generation script:

    $ cd scripts
    $ node generate-definition-files.js


This script generates the meteor.d.ts file from the [Meteor data.js file] (https://github.com/meteor/meteor/blob/devel/docs/client/data.js) that is used
to generate the official [Meteor docs] (http://docs.meteor.com/). 

This script also retrieves the latest third-party library definitions from the [DefinitelyTyped] (https://github.com/borisyankov/DefinitelyTyped) repo, which is the
semi-official repository for TypeScript definition files.  Running this script will also run any specified tests found on [DefinitelyTyped] (https://github.com/borisyankov/DefinitelyTyped),
as well as the tests for meteor.d.ts and any other meteor packages.  All tests that are run can be found in "definition-tests/".

The script depends on node modules lodash and request, so these must be installed on your system before running the script (along with the [Typescript Transpiler] (http://www.typescriptlang.org/)): 
 
    $ [sudo -H] npm install -g lodash 
    $ [sudo -H] npm install -g request
    For the TypeScript transpiler:  $ [sudo -H] npm install -g typescript

Any changes to the meteor definitions file, "meteor.d.ts", should be made by altering "scripts/generate-definition-files.js".  Corresponding changes should also be made 
to "definition-tests/meteor-tests.ts".

Changes to the smart package definitions can be made directly to those definition files (e.g. ironrouter.d.ts).



