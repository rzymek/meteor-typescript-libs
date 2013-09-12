#Meteor Typescript libraries

Empty package to easily bring all Meteor Typescript definitions into your project. 

## What do you get?

Typescript definitions for some of the most popular Meteor packages.
   To be used with [https://github.com/orefalo/meteor-typescript-compiler](https://github.com/orefalo/meteor-typescript-compiler)


* Starting with **meteor.d.ts**
* observatory
* backbone
* underscore
* underscore-string
* jquery
* d3
* ecma
* node

## Installation

* mrt add typescript-libs

This will create a **packages/typescript-libs** folder in your project will all the required reference files.
  Those can now be references with a ///<reference path="/path/to/packages/typescript-libs/meteor.d.ts" /> like tag.
 No files are being added to the build.

## Other projects of interest

* [https://github.com/orefalo/meteor-typescript-compiler](https://github.com/orefalo/meteor-typescript-compiler)
* [https://github.com/orefalo/meteor-typescript-demos](https://github.com/orefalo/meteor-typescript-demos)
