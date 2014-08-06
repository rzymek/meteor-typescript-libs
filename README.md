# Meteor Typescript libraries

Easily brings Meteor Typescript definitions into your project.  Definitions for Meteor core libraries are current for Meteor version 0.8.3.



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

This will create a **packages/typescript-libs** folder in your project will all the required reference files.  You can reference all the definition files with a
single line:

    ///<reference path="/path/to/packages/typescript-libs/all-definitions.d.ts" />

Or you can reference an individual definition file:

    ///<reference path="/path/to/packages/typescript-libs/meteor.d.ts" />
    ///<reference path="/path/to/packages/typescript-libs/underscore.d.ts" />
    ///<reference path="/path/to/packages/typescript-libs/jquery.d.ts" />


No files are added to the build.



## Contents
Meteor-specific definitions (core and certain smart packages):

* **meteor.d.ts**: definitions for everything in the [Meteor docs] (http://docs.meteor.com/)
* collectionfs
* flash-messages
* google-maps (smart package)
* ironrouter
* roles.d.ts
* smart-collections

Other third-party library definitions

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
* ecma
* node



## Usage Overview
Talk about WebStorm or meteor-typescript-compiler

For most applications, there are 5 specific steps you will have to take to write your Meteor application in TypeScript using this package:

1. [Reference the definitions] (#usage-type-definition-references) in TypeScript files
2. Declare functions for [Templates] (#usage-templates) in a special way
3. Declare [Collections](#usage-collections) in a special way
4. [Create custom definitions](#usage-creating-definitions) for code you write


## Usage: Type Definition references
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

For "dot" notation, TypeScript requires properties be specified on a variable (but not for bracket notation), and it will throw an error saying "myTemplateName" does not exist on Template.



## Usage: Collections
The majority of extra work required to use TypeScript with Meteor is creating and maintaining the collection interfaces.  However, doing so provides you with
the benefit of creating succinct, enforceable schema definitions for your collections.

To define collections, you will need to create an interface representing the collection, and then declare a Collection type variable with that interface type (as a generic):

    interface JobDAO {
      _id?: string;
      name: string;
      status?: string;
      queuedAt?: string;
    }

    declare var Jobs: Meteor.Collection<JobDAO>;
    Jobs = new Meteor.Collection<JobDAO>('jobs');

For a larger project, it's recommended to define the collections (the code above) in a separate file (e.g. collections/models/models.ts) and then create a separate file per collection with
the methods and permissions for that collection (e.g. collections/jobs.ts).  In order for Meteor to find these variable declarations before use, the collection definitions should be one
directory deeper than the collection method/permission declarations (e.g. collections/models/models.ts).

Finally, any TypeScript file using collections will need to contain a reference at the top pointing to the collection definitions:

    /// <reference path="../packages/typescript-libs/meteor.d.ts"/>
    /// <reference path="../packages/typescript-libs/underscore.d.ts"/>
    /// <reference path="models/models.ts"/>



## Usage: Creating Definitions
Here is a guide to creating definitions: <http://www.typescriptlang.org/Handbook#writing-dts-files>



## Usage: Transpilation
WebStorm is good TypeScript-aware editor.  It can automatically transpile your TypeScript code into JavaScript every time you save a file.  To enable this
feature in WebStorm on OSX, go to Preferences -> File Watchers -> Plus symbol and add TypeScript.

If you are not using a TypeScript-aware editor, you can transpile the files using the [Meteor Typescript Compiler](https://github.com/orefalo/meteor-typescript-compiler).



## Learning Resources
Here are some resources to get you going quickly:
* (TypeScript Handbook)[http://www.typescriptlang.org/Handbook]



## Example/Reference Projects
* [TypeScript demos](https://github.com/orefalo/meteor-typescript-demos)



## Contributing
All Files are generated by executing a file generation script

    $ node scripts/generate-definition-files.js

Any changes to the meteor.d.ts should be made by altering generate-definition-files.js.

Changes to the smart package definitions can be made directly to those definition files (e.g. ironrouter.d.ts).

Changes to the definitions for any third party libraries (e.g. jquery.d.ts) should be made on the (DefinitelyTyped) [https://github.com/borisyankov/DefinitelyTyped] repo, which
is the semi-official repository for TypeScript definition files.



## Other projects of interest

* [https://github.com/orefalo/meteor-typescript-compiler](https://github.com/orefalo/meteor-typescript-compiler)
* [https://github.com/orefalo/meteor-typescript-demos](https://github.com/orefalo/meteor-typescript-demos)

