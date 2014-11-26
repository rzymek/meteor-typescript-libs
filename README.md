# Meteor TypeScript libraries

This project is a placeholder for typescript definition files related to Meteor.
 You will find, among others **meteor.d.ts** plus many others.

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

1. Look for the typescript library you are interested in and copy it to your project.
2. Ensure you installed the [Typescript compiler for Meteor](https://github.com/meteor-typescript/meteor-typescript-compiler) or an [IDE which can transpile code](#transpilation).
3. From the typescript files, add references as follows:

   Once the files are copied to your project, reference all the definition files with a single line:

    ```
    /// <reference path="/path/to/all-definitions.d.ts" />
    ```
    
   Or you can reference definition files individually:
   
    ```
    /// <reference path="/path/to/meteor.d.ts" />
    /// <reference path="/path/to/underscore.d.ts" />
    /// <reference path="/path/to/jquery.d.ts" />
    ```
4. Be aware of differences in coding styles when using TypeScript (see below)


##  TypeScript/Meteor coding style

### Reference

Try to stay away from referencing **file.ts**, rather generate a **file.d.ts** using `tsc --reference file.ts`, and reference it in your file. Compilation will be much faster and code cleaner - it's always better to split definition from implemention.

### Templates

When specifying template helper, you will need to use a "bracket notation" instead of the "dot notation":

    Template['myTemplateName'].helpers({
      foo: function () {
        return Session.get("foo");
      }
    });

That's because Typescript enforces typing and it will throw an error saying "myTemplateName" does not exist when using the dot notation.

### Accessing a Form field

Trying to read a form field value? use `(<HTMLInputElement>evt.target).value`.

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

    /// <reference path="/path/to/meteor.d.ts"/>
    /// <reference path="/path/to/underscore.d.ts"/>
    /// <reference path="models/models.ts"/>


If you choose to define collections (using the code above) in a separate file (e.g. collections/models/models.ts) and then create a separate file per collection 
with the methods and permissions for that collection (e.g. collections/jobs.ts), the collection definitions should be one directory deeper than the collection 
method/permission declarations so that Meteor can find the variable declarations before use. (e.g. collections/models/models.ts).






## Compiling TypeScript

### Meteor plugin
An elegant solution is to install the following meteor package [https://github.com/meteor-typescript/meteor-typescript-compiler](https://github.com/meteor-typescript/meteor-typescript-compiler)

### Transpilation
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


This script generates the meteor.d.ts file from the [Meteor api.js file] (https://raw.githubusercontent.com//meteor/meteor/devel/docs/client/api.js) that is used
to generate the official [Meteor docs] (http://docs.meteor.com/). 

This script gets the latest of all third-party libraries from the [DefinitelyTyped] (https://github.com/borisyankov/DefinitelyTyped) repo, which is the 
semi-official repository for TypeScript definition files.  Running this script will also run any specified transpilation tests found on [DefinitelyTyped] (https://github.com/borisyankov/DefinitelyTyped).
All tests that are run can be found in "definition-tests/".

The script depends on node modules lodash and request, so these must be installed on your system before running the script (along with the [Typescript Transpiler] (http://www.typescriptlang.org/)): 
 
    $ [sudo -H] npm install -g lodash 
    $ [sudo -H] npm install -g request
    For the TypeScript transpiler:  $ [sudo -H] npm install -g typescript

Any changes to the meteor definitions file, "meteor.d.ts", should be made by altering "scripts/generate-definition-files.js".  Corresponding changes should also be made 
to "definition-tests/meteor-tests.ts".

Changes to the smart package definitions can be made directly to those definition files (e.g. ironrouter.d.ts).



