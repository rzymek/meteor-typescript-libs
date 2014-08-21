# Meteor TypeScript libraries

This package adds Meteor TypeScript definitions to your project.  Definitions for the Meteor core library are current for Meteor version 0.8.3.



## Why use TypeScript?
TypeScript allows you to specify and enforce variable types and interfaces.  It will inform you of errors before deployment/runtime, often with more informative
errors (e.g. a required property can't be found).  A TypeScript-aware editor, like WebStorm, will provide you with code completion and code help/tips, as well as
real-time type-checking and error information.  TypeScript code is much more self-documenting than straight-up, uncommented JavaScript code.

There is some time investment required to use TypeScript, and the benefits will probably outweigh the costs when a code base is large and will be refactored
many times, and/or will be worked on by multiple developers.

TypeScript will NOT make JavaScript prettier (like CoffeeScript).



## Installation
This smart package can be installed with [Meteorite] (https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

    $ mrt add typescript-libs


This will create a **packages/typescript-libs** folder in your project with all the required reference files.  You can reference all the definition files with a
single line:

    ///<reference path="/path/to/packages/typescript-libs/all-definitions.d.ts" />


Or you can reference definition files individually:

    ///<reference path="/path/to/packages/typescript-libs/meteor.d.ts" />
    ///<reference path="/path/to/packages/typescript-libs/underscore.d.ts" />
    ///<reference path="/path/to/packages/typescript-libs/jquery.d.ts" />



## Contents
Meteor-specific definitions (core and certain smart packages):

* **meteor.d.ts**: definitions for everything in the [Meteor docs] (http://docs.meteor.com/)
* collectionfs
* flash-messages
* google-maps (smart package)
* ironrouter
* roles.d.ts
* smart-collections

Other third-party library definitions:

* backbone
* bootstratp
* d3
* google maps
* observatory
* backbone
* underscore
* underscore-string
* jquery
* d3
* node



## Usage Overview
For most applications, there are 4 specific steps you will have to take to write your Meteor application in TypeScript using this package:

1. [Reference the definitions in TypeScript files] (#usage-type-definition-references)
2. [Declare functions for Templates in a special way] (#usage-templates)
3. [Declare Collections in a special way] (#usage-collections)
4. [Create custom definitions for code you write] (#usage-creating-definitions)


## Usage: Type Definition References
Within any TypeScript file, you can reference all the definition files with a single line at the top:

    ///<reference path="/path/to/packages/typescript-libs/all-definitions.d.ts" />


Alternatively you can reference individual definition files:

    ///<reference path="/path/to/packages/typescript-libs/meteor.d.ts" />
    ///<reference path="/path/to/packages/typescript-libs/underscore.d.ts" />
    ///<reference path="/path/to/packages/typescript-libs/jquery.d.ts" />



## Usage: Templates
When specifying template functions, you will need to use "bracket notation" instead of "dot notation":

    Template['myTemplateName']['rendered'] = function ( ) { ... }

    Template['myTemplateName']['helpers']({
      foo: function () {
        return Session.get("foo");
      }
    });

    Template['myTemplateName']['foo'] = function () {
      return Session.get("foo");
    };


For "dot" notation, TypeScript requires properties be specified on a variable (but not for bracket notation), and it will throw an error saying "myTemplateName" 
does not exist on Template.



## Usage: Collections
The majority of extra work required to use TypeScript with Meteor is creating and maintaining the collection interfaces.  However, doing so also provides the 
additional benefit of succinctly documenting collection schema definitions (that are actually enforced).

To define collections, you will need to create an interface representing the collection, and then declare a Collection type variable with that interface type (as a generic):

    interface JobDAO {
      _id?: string;
      name: string;
      status?: string;
      queuedAt?: string;
    }

    declare var Jobs: Meteor.Collection<JobDAO>;
    Jobs = new Meteor.Collection<JobDAO>('jobs');


Finally, any TypeScript file using collections will need to contain a reference at the top pointing to the collection definitions:

    /// <reference path="../packages/typescript-libs/meteor.d.ts"/>
    /// <reference path="../packages/typescript-libs/underscore.d.ts"/>
    /// <reference path="models/models.ts"/>


If you choose to define collections (using the code above) in a separate file (e.g. collections/models/models.ts) and then create a separate file per collection 
with the methods and permissions for that collection (e.g. collections/jobs.ts), the collection definitions should be one directory deeper than the collection 
method/permission declarations so that Meteor to find the variable declarations before use. (e.g. collections/models/models.ts).



## Usage: Creating Definitions
Here is a guide to creating definitions: <http://www.typescriptlang.org/Handbook#writing-dts-files>



## Usage: Transpilation
WebStorm is good TypeScript-aware editor.  It can automatically transpile your TypeScript code into JavaScript every time you save a file.  To enable this
feature in WebStorm on OSX, go to Preferences -> File Watchers -> "+" symbol and add TypeScript.

If you are not using a TypeScript-aware editor, you can transpile the files using the [Meteor Typescript Compiler](https://github.com/orefalo/meteor-typescript-compiler).



## Learning Resources
Here are some resources to get you going quickly:
* [TypeScript Handbook](http://www.typescriptlang.org/Handbook)



## Example/Reference Projects
* [TypeScript demos](https://github.com/orefalo/meteor-typescript-demos)



## Contributing
All definition files are generated by executing a file generation script:

    $ cd scripts
    $ node generate-definition-files.js


This script gets the latest of all third-party libraries from the [DefinitelyTyped] (https://github.com/borisyankov/DefinitelyTyped) repo, which is the 
semi-official repository for TypeScript definition files.  Running this script will also run any specified transpilation tests found on [DefinitelyTyped] (https://github.com/borisyankov/DefinitelyTyped).
All tests that are run can be found in "definition-tests/".

Any changes to the meteor definitions file, "meteor.d.ts", should be made by altering "scripts/generate-definition-files.js".  Corresponding changes should also be made 
to "definition-tests/meteor-tests.ts".

Changes to the smart package definitions can be made directly to those definition files (e.g. ironrouter.d.ts).

Changes to the definitions for any third party libraries (e.g. jquery.d.ts) should be made on the [DefinitelyTyped] (https://github.com/borisyankov/DefinitelyTyped)
repo.



## Other Projects of Interest

* [https://github.com/orefalo/meteor-typescript-compiler](https://github.com/orefalo/meteor-typescript-compiler)
* [https://github.com/orefalo/meteor-typescript-demos](https://github.com/orefalo/meteor-typescript-demos)

