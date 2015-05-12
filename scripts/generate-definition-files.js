/**
 * This script downloads the third part typescript definitions, generates "meteor.d.ts" from
 * the meteor data.js file (https://github.com/meteor/meteor/blob/devel/docs/client/data.js),
 * and creates "all-definitions.d.ts", which has references to all of the typescript definition files.
 *
 * You can execute this script from the command line: "$node typescript-file-generator.js"
 *
 * This converter is based on Sam Hatoum's webstorm-converter.js:  https://github.com/xolvio/meteor-webstorm-library
 * Sam Hatoum:  https://github.com/samhatoum
 *
 * The original modifications to webstorm-converter to create this file were made by Dave Allen:  https://github.com/fullflavedave
 */

// All paths should be relative to this directory, "scripts"
var vm = require('vm'),
    fs = require('fs'),
    _ = require('lodash'),
    DEF_DIR = './definitions/',
    SCRIPT_TEST_DIR = './script-definition-tests/',
    TINYTEST_TEST_DIR = './tinytest-definition-tests/',
    TINYTEST_DEF_BASE_PATH = '../../meteortypescript_typescript-libs/',
    METEOR_API_URL = 'https://raw.githubusercontent.com/meteor/meteor/devel/docs/client/data.js',
    SAVED_METEOR_API_FILE_PATH = './lib/data.js';
    MANUALLY_MAINTAINED_DEFS_FILE = './lib/meteor-manually-maintained-definitions.d.ts',
    METEOR_DEF_FILENAME = 'meteor.d.ts',
    DEBUG = true,
    definitionFilenames = [], // References to these files will be written to the master definition file
    testFilenames = ['meteor-tests.ts'],
    moduleNames = [],
    globalClassNames = [];
    globalFunctionNames = [];
// Global var DocsData created in function runApiFileInThisContext()


// Not currently called -- not sure how to automatically generate latest lib.d.ts
var typescriptCoreLibs = [
    'https://github.com/Microsoft/TypeScript/raw/master/src/lib/core.d.ts',
    'https://github.com/Microsoft/TypeScript/raw/master/src/lib/dom.generated.d.ts',
    'https://github.com/Microsoft/TypeScript/raw/master/src/lib/extensions.d.ts',
    'https://github.com/Microsoft/TypeScript/raw/master/src/lib/importcore.d.ts',
    'https://github.com/Microsoft/TypeScript/raw/master/src/lib/scriptHost.d.ts',
    'https://github.com/Microsoft/TypeScript/raw/master/src/lib/webworker.generated.d.ts',
    'https://github.com/Microsoft/TypeScript/raw/master/src/lib/webworker.importscripts.d.ts'
];

var thirdPartyDefLibs = [
    //'https://github.com/borisyankov/DefinitelyTyped/tree/master/mongodb/mongodb.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/underscore/underscore.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/underscore.string/underscore.string.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/jquery/jquery.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/backbone/backbone.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/bootstrap/bootstrap.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/d3/d3.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/handlebars/handlebars.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/node/node.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/node-fibers/node-fibers.d.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/googlemaps/google.maps.d.ts'
    //'https://github.com/borisyankov/DefinitelyTyped/raw/master/lodash/lodash.d.ts'
];

var thirdPartyDefTests = [
    //'https://github.com/borisyankov/DefinitelyTyped/raw/master/mongodb/mongodb-tests.ts',  // not working right now
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/underscore/underscore-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/underscore.string/underscore.string-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/jquery/jquery-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/backbone/backbone-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/bootstrap/bootstrap-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/d3/d3-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/handlebars/handlebars-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/node/node-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/node-fibers/node-fibers-tests.ts'
    //'https://github.com/borisyankov/DefinitelyTyped/raw/master/lodash/lodash-tests.ts'
];


// keys are strings that will be sent into new RegExp(<regexp string>)
var argTypeMappings = {
    'function': 'Function',
    'MatchPattern': 'any',
    'Array.<String>': 'string[]',
    'String': 'string',
    'clone<T>\\(val: EJSON': 'clone<T>(val: T',
    'JSONCompatible': 'JSON',
    //'EJSONable': 'EJSONable',
    'Array.<EJSON>': 'EJSON[]',
    'Array.<EJSONable>': 'EJSONable[]',
    'DOMElement': 'HTMLElement',
    'DOMNode': 'Node',
    'EventMap': '{[actions: string]: Function}',
    'MongoFieldSpecifier': 'Mongo.FieldSpecifier',
    'Number':'number',
    'Integer': 'number',
    'Any': 'any',
    'function:': 'func:',
    'renderFunction:': 'renderFunction?:',
    'MongoSelector': 'Mongo.Selector',
    'MongoModifier': 'Mongo.Modifier',
    'MongoSortSpecifier': 'Mongo.SortSpecifier',
    'null': 'any /** Null **/',
    'undefined': 'any /** Undefined **/',
    'Buffer': 'any /** Buffer **/',
    'IterationCallback': '<T>(doc: T, index: number, cursor: Mongo.Cursor<T>) => void',
    'Tracker.ComputationFunction': '(computation: Tracker.Computation) => void',
    'Array.<Object>': 'Object[]'
};

// Regex mappings for full flexibility
var signatureElementMappings = {
    'clone\\(val: EJSON\\): T;': 'clone<T>(val:T): T;',
    'fetch\\(\\);': 'fetch(): Array<T>;',
    'find\\(selector: any, options\\?\\);': 'find(selector?: any, options?): Meteor.Cursor<T>;',
    'findOne\\(selector: any, options\\?\\);': 'findOne(selector?, options?): T;',
    'insert\\(doc: Object, callback\\?\\);': 'insert(doc: T, callback?: Function): string;',
    'subscribe\\(name: string, arg1, arg2...\\?: any, callbacks\\?: any\\)': 'subscribe(name: string, ...args: any[])',
    'call\\(name: string, arg1, arg2...\\?: EJSONable, asyncCallback\\?: Function\\)': 'call(name: string, ...args: any[])',
    'function body\\(\\)': 'body: TemplateStaic',
    'helpers\\(helpers: Object\\)': 'helpers(helpers:{[id:string]: any})',
    'sourcePath\\?: string, line: number, func: string': 'sourcePath?: string, line?: number, func?: string',
    'function export': '// function export',
    'ReactiveVar\\(initialValue: any, equalsFunc\\?: Function\\)': 'ReactiveVar(initialValue: any, equalsFunc?: (oldVal:any, newVal:any)=>boolean)',
    'Boolean': 'boolean',
    'depends\\(dependencies: Object\\)': 'depends(dependencies:{[id:string]:string})',
    'insert\\?: Function;': 'insert?: (userId:string, doc) => boolean;',
    'update\\?: Function;': 'update?: (userId, doc, fieldNames, modifier) => boolean;',
    'remove\\?: Function;': 'remove?: (userId, doc) => boolean;',
    'arg1, arg2...\\?: any(.|\n)*\\)': '...args: any[])',
    'function: Function\\)': 'helperFunction: Function)',
    'renderFunction: Function\\)': 'renderFunction?: Function)',

    'function send\\(options\\)': 'function send(options: Email.EmailMessage)',
    'find\\(selector:': 'find(selector?:',
    'findOne\\(selector:': 'findOne(selector?:',
    'Collection\\(name: string,': 'Collection<T>(name: string,',
    '\\(initialValue: any,': '(initialValue: T,',
    'set\\(newValue: any\\)': 'set(newValue: T)',
    'addType\\(name: string, factory: Function\\)': 'addType(name: string, factory: (val: EJSONable) => JSONable)',

    'insert\\?: \\(userId:string, doc\\)': 'insert?: (userId: string, doc: T)',
    'update\\?: \\(userId, doc, fieldNames, modifier\\)': 'update?: (userId: string, doc: T, fieldNames: string[], modifier: any)',
    'remove\\?: \\(userId, doc\\)': 'remove?: (userId: string, doc: T)'
};

var propertyAndReturnTypeMappings = {
    'Meteor.isClient': 'boolean',
    'Meteor.isServer': 'boolean',
    'Meteor.isCordova': 'boolean',
    'Meteor.wrapAsync': 'any',
    'Meteor.startup': 'void',
    'Meteor.absoluteUrl': 'string',
    'Meteor.settings': '{[id:string]: any}',
    'Meteor.release': 'string',
    'Meteor.publish': 'void',
    'Meteor.subscribe': 'Meteor.SubscriptionHandle',
    'Blaze.TemplateInstance#subscribe': 'Meteor.SubscriptionHandle',
    'Meteor.apply': 'any',
    'Meteor.call': 'any',
    'Meteor.clearTimeout': 'void',
    'Meteor.clearInterval': 'void',
    'Meteor.disconnect': 'void',
    'Meteor.loggingIn': 'boolean',
    'Meteor.logout': 'void',
    'Meteor.logoutOtherClients': 'void',
    'Meteor.loginWithPassword': 'void',
    'Meteor.loginWith<ExternalService>': 'void',
    'Meteor.methods': 'void',
    'Meteor.reconnect': 'void',
    'Meteor.setTimeout': 'number',
    'Meteor.setInterval': 'number',
    'Meteor.status': 'Meteor.StatusEnum',
    'Meteor.user': 'Meteor.User',
    'Meteor.users': 'Mongo.Collection<User>',
    'Meteor.userId': 'string',
    'Meteor.onConnection': 'void',

    'Mongo.Collection#find': 'Mongo.Cursor<T>',
    'Mongo.Collection#findOne': 'T',
    'Mongo.Collection#insert': 'string',
    'Mongo.Collection#update': 'number',
    'Mongo.Collection#upsert': '{numberAffected?: number; insertedId?: string;}',
    'Mongo.Collection#remove': 'void',
    'Mongo.Collection#allow': 'boolean',
    'Mongo.Collection#deny': 'boolean',
    'Mongo.Cursor#count': 'number',
    'Mongo.Cursor#fetch': 'Array<T>',
    'Mongo.Cursor#forEach': 'void',
    'Mongo.Cursor#map': 'Array<T>',
    'Mongo.Cursor#observe': 'Meteor.LiveQueryHandle',
    'Mongo.Cursor#observeChanges': 'Meteor.LiveQueryHandle',
    'Plugin.registerSourceHandler': 'void',
    'Package.describe': 'void',
    'Package.onUse': 'void',
    'Package.onTest': 'void',
    'Package.registerBuildPlugin': 'void',
    'Npm.depends': 'void',
    'Npm.require': 'any',
    'Cordova.depends': 'void',
    'Blaze.TemplateInstance#$': 'any',
    'Blaze.TemplateInstance#findAll': 'Blaze.TemplateInstance[]',
    'Blaze.TemplateInstance#find': 'Blaze.TemplateInstance',
    'Blaze.render': 'Blaze.View',
    'Blaze.renderWithData': 'Blaze.View',
    'Blaze.remove': 'void',
    'Blaze.Data': 'Meteor.DataContext',
    'Blaze.toHTML': 'string',
    'Blaze.toHTMLWithData': 'string',
    'Blaze.isTemplate': 'boolean',
    'Blaze.currentView': 'Blaze.View',
    'Blaze.With': 'Blaze.View',
    'Blaze.If': 'Blaze.View',
    'Blaze.Unless': 'Blaze.View',
    'Blaze.Each': 'Blaze.View',
    'Blaze.Let': 'Blaze.View',
    'Blaze.getData': 'Object',
    'Blaze.getView': 'Blaze.View',
    'Blaze.TemplateInstance#data': 'Object',
    'Blaze.TemplateInstance#view': 'Object',
    'Blaze.TemplateInstance#firstNode': 'Object',
    'Blaze.TemplateInstance#lastNode': 'Object',
    'Blaze.TemplateInstance#autorun': 'Object',

    'Accounts.validateLoginAttempt': '{stop: Function}',
    'Accounts.onLogin': '{stop: Function}',
    'Accounts.onLoginFailure': '{stop: Function}',
    'Accounts.onResetPasswordLink': 'void',
    'Accounts.onEmailVerificationLink': 'void',
    'Accounts.onEnrollmentLink': 'void',
    'Accounts.config': 'void',
    'Accounts.validateNewUser': 'void',
    'Accounts.onCreateUser': 'void',
    'Accounts.createUser': 'string',
    'Accounts.changePassword': 'void',
    'Accounts.forgotPassword': 'void',
    'Accounts.resetPassword': 'void',
    'Accounts.setPassword': 'void',
    'Accounts.verifyEmail': 'void',
    'Accounts.sendResetPasswordEmail': 'void',
    'Accounts.sendEnrollmentEmail': 'void',
    'Accounts.sendVerificationEmail': 'void',
    'Accounts.emailTemplates': 'Meteor.EmailTemplates',
    'Accounts.ui.config': 'void',

    'EJSON.parse': 'EJSON',
    'EJSON.stringify': 'string',
    'EJSON.fromJSONValue': 'any',
    'EJSON.toJSONValue': 'JSON',
    'EJSON.equals': 'boolean',
    'EJSON.newBinary': 'any',
    'EJSON.isBinary': 'boolean',
    'EJSON.addType': 'void',
    'EJSON.clone': 'T',
    'EJSON.CustomType#typeName': 'string',
    'EJSON.CustomType#toJSONValue': 'JSON',
    'EJSON.CustomType#clone': 'EJSON.CustomType',
    'EJSON.CustomType#equals': 'boolean',

    'App.info': 'void',
    'App.setPreference': 'void',
    'App.configurePlugin': 'void',
    'App.icons': 'void',
    'App.launchScreens': 'void',
    'App.accessRule': 'void',

    'Template#onCreated': 'Function',
    'Template#onRendered': 'Function',
    'Template#onDestroyed': 'Function',
    'Template#created': 'Function',
    'Template#rendered': 'Function',
    'Template#destroyed': 'Function',
    'Template#events': 'void',
    'Template#helpers': 'void',
    'Template.body': 'Template',
    'Template.instance': 'Blaze.TemplateInstance',
    'Template.currentData': '{}',
    'Template.parentData': '{}',
    'Template.registerHelper': 'void',

    'ReactiveVar#get': 'T',
    'ReactiveVar#set': 'void',

    'Subscription#connection': 'Meteor.Connection',
    'Subscription#userId': 'string',
    'Subscription#error': 'void',
    'Subscription#stop': 'void',
    'Subscription#onStop': 'void',
    'Subscription#added': 'void',
    'Subscription#changed': 'void',
    'Subscription#removed': 'void',
    'Subscription#ready': 'void',

    'PackageAPI#use': 'void',
    'PackageAPI#imply': 'void',
    'PackageAPI#addFiles': 'void',
    'PackageAPI#versionsFrom': 'void',
    'PackageAPI#export': 'void',

    'Tracker.flush': 'void',
    'Tracker.nonreactive': 'void',
    'Tracker.active': 'boolean',
    'Tracker.currentComputation': 'Tracker.Computation',
    'Tracker.onInvalidate': 'void',
    'Tracker.afterFlush': 'void',
    'Tracker.autorun': 'Tracker.Computation',
    'Tracker.Computation': 'void',
    'Tracker.Computation#stop': 'void',
    'Tracker.Computation#invalidate': 'void',
    'Tracker.Computation#onInvalidate': 'void',
    'Tracker.Computation#onStop': 'void',
    'Tracker.Computation#stopped': 'boolean',
    'Tracker.Computation#invalidated': 'boolean',
    'Tracker.Computation#firstRun': 'boolean',
    'Tracker.Dependency#changed': 'void',

    'HTTP.call': 'HTTP.HTTPResponse',
    'HTTP.get': 'HTTP.HTTPResponse',
    'HTTP.post': 'HTTP.HTTPResponse',
    'HTTP.put': 'HTTP.HTTPResponse',
    'HTTP.del': 'HTTP.HTTPResponse',

    'Session.set': 'void',
    'Session.setDefault': 'void',
    'Session.get': 'any',
    'Session.equals': 'boolean',

    'Email.send': 'void',

    'Assets.getText': 'string',
    'Assets.getBinary': 'EJSON',

    'Match.test': 'boolean',

    'DDP.connect': 'DDP.DDPStatic',

    'CompileStep#addAsset': 'any',
    'CompileStep#addHtml': 'any',
    'CompileStep#addJavaScript': 'any',
    'CompileStep#addStylesheet': 'any',
    'CompileStep#arch': 'any',
    'CompileStep#declaredExports': 'any',
    'CompileStep#error': 'any',
    'CompileStep#fileOptions': 'any',
    'CompileStep#fullInputPath': 'any',
    'CompileStep#inputPath': 'any',
    'CompileStep#inputSize': 'any',
    'CompileStep#packageName': 'any',
    'CompileStep#pathForSourceMap': 'any',
    'CompileStep#read': 'any',
    'CompileStep#rootOutputPath': 'any',

    'check': 'void',

    'DDPCommon.MethodInvocation': 'any'

};

var getThirdPartyDefLibs = function() {
    _.each(thirdPartyDefLibs, function(lib) {
        require('request')(lib, function(error, response, body) {
            var filename = lib.slice(lib.lastIndexOf('/') + 1);
            if (hasString(lib, '/core.d.ts')) filename = filename.replace('core', 'lib');
            definitionFilenames.push(filename);
            body = body.replace('../jquery/jquery.d.ts', 'jquery.d.ts');
            body = body.replace('../underscore/underscore.d.ts', 'underscore.d.ts');
            writeFileToDisk(DEF_DIR + filename, body);
        })
    });
};

var getThirdPartyDefTests = function() {
    _.each(thirdPartyDefTests, function(test) {
        require('request')(test, function(error, response, body) {
            var filename = test.slice(test.lastIndexOf('/') + 1);
            testFilenames.push(filename);
            //var originalBody = JSON.parse(JSON.stringify(body));
            body = body.replace('../jquery/jquery.d.ts', 'jquery.d.ts');
            body = body.replace('../underscore/underscore.d.ts', 'underscore.d.ts');
            body = body.replace(/path=["'\.\/]+(.+\.d\.ts)["']\s?\/>/g, 'path="../definitions/$1" />');
            writeFileToDisk(SCRIPT_TEST_DIR + filename, body);

            // for Tinytest
            body = body.replace(/path=["'\.\/]+(.+\.d\.ts)["']\s?\/>/g, 'path="' + TINYTEST_DEF_BASE_PATH + '$1" />');
            writeFileToDisk(TINYTEST_TEST_DIR + filename, body);
        })
    });
};

// Not currently used -- not sure how to automatically generate latest lib.d.ts
var createTypeScriptLibFile = function() {
    fs.truncate(DEF_DIR + 'lib.d.ts');
    _.each(typescriptCoreLibs, function(lib) {
        setTimeout(function() {
            require('request')(lib, function(error, response, body) {
                fs.appendFile(DEF_DIR + 'lib.d.ts', body);
            })
        }, 500);
    });
};

var replaceIrregularArgTypes = function(argSection) {
    for (var key in argTypeMappings) {
        // Needs to use the RegExp form of replace so can be global in case of multiple arg types
        argSection = argSection.replace(key, argTypeMappings[key]);
    }
    return argSection;
};

var replaceSignatureElements = function(funcSignature) {
    for (var key in signatureElementMappings) {
        funcSignature = funcSignature.replace(new RegExp(key, 'g'), signatureElementMappings[key]);
    }
    return funcSignature;
};

var classesWithGenerics = ['Mongo.Collection', 'Mongo.Cursor', 'ReactiveVar'];  // Need to add a generic type to interface definition

var addGenerics = function(longName) {
    if (_.contains(classesWithGenerics, longName)) {
        return '<T>';
    } else {
        return '';
    }
};

var addPropertyOrReturnTypeAndComplete = function(longName, returns) {
    var returnValue = propertyAndReturnTypeMappings[longName];
    if (returnValue && returnValue.length !== 0) {
        return ': ' + returnValue + ';';
    }
    if (returns && returns[0] && returns[0].type) {
        return ': ' + returns[0].type.names[0] + ';';
    }
    return DEBUG ? '; /** TODO: add return value **/' : ';';
};

var writeFileToDisk = function(path, content) {
    fs.writeFile(path, content, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('File written to ' + path);
        }
    });
};

var addManuallyMaintainedDefs = function() {
    var interfaces = fs.readFileSync(MANUALLY_MAINTAINED_DEFS_FILE);
    interfaces += '\n';
    return interfaces;
};

// Creates global var DocsData with contents of meteorClientApiFile
var runApiFileInThisContext = function(meteorClientApiFile) {
    vm.runInThisContext("DocsData = {};" + meteorClientApiFile);
};

var hasString = function(haystack, needle) {
    return haystack.indexOf(needle) !== -1;
};

var populateModuleAndGlobalClassNames = function(meteorClientApiFile) {
    runApiFileInThisContext(meteorClientApiFile);
    _.forIn(DocsData, function (value, key) {  // Global var DocsData created in function runApiFileInThisContext()
        if (value.kind === 'namespace' && !value.memberof) {
            moduleNames.push(key);
        }
        if (value.kind === 'class' && !value.memberof) {
            globalClassNames.push(key);
        }
        if (value.kind === 'function' && !value.memberof) {
            globalFunctionNames.push(key);
        }
    });
    moduleNames.push('Session'); // TODO: fix exception
    moduleNames.push('HTTP'); // TODO: fix exception
    moduleNames.push('Email'); // TODO: fix exception
    moduleNames = _.filter(moduleNames, function(modName) {
        return modName !== 'Plugin';
    });
    console.log('Global Modules: ' + JSON.stringify(moduleNames));
    console.log('Global Classes: ' + JSON.stringify(globalClassNames));

};

var createArgTypes = function(argTypes) {
    var argTypesSection = '';
    argTypes.forEach(function(type, index) {
        type = replaceIrregularArgTypes(type);
        if (index === 0) {
            argTypesSection += type;
        } else {
            argTypesSection += ' | ' + type;
        }
    });
    return argTypesSection;
};

var createArgs = function(apiDef) {
    var argSection = '(';
    _.each(apiDef.params, function(param, index) {
        argSection += param.name;
        if (param.optional) argSection += '?';
        if (param.name !== 'options') {
            argSection += ': ' + createArgTypes(param.type.names);
        } else {
            argSection += ': {\n';
            apiDef.options.forEach(function(optionParam) {
                if (hasString(optionParam.name, ',')) {     // Special case for App.info, Mongo.Collection#allow, Mongo.Collection#deny
                    var optionsArray = optionParam.name.split(',');
                    optionsArray.forEach(function(singleOptionName) {
                        argSection += '\t\t\t\t' + singleOptionName + '?: ' + createArgTypes(optionParam.type.names) + ';\n';
                    });
                } else {
                    argSection += '\t\t\t\t' + optionParam.name + '?: ' + createArgTypes(optionParam.type.names) + ';\n'
                }
            });
            argSection += '\t\t\t}';
        }
        if (index !== apiDef.params.length - 1) argSection += ', ';
    });
    argSection += ')';

    return argSection;
};

var createInnerVar = function createInnerVar(apiDef) {
    var content = '\tvar ' + apiDef.name + ': {\n';
    content += '\t' + createModuleInnerContent(apiDef.longname, '', true);
    content += '\t};\n';
    return content;
};

var createSimpleClass = function createSimpleClass(apiDef, tabs) {
    tabs = tabs || '';
    var constructorSignature = tabs + 'function ' + apiDef.name + addGenerics(apiDef.longname) + createArgs(apiDef) + ': void;\n';
    content = replaceSignatureElements(constructorSignature);
    content += tabs + 'interface ' + apiDef.name + addGenerics(apiDef.longname) + ' {\n';
    content += createModuleInnerContent(apiDef.longname, tabs, true);
    content += tabs + '}\n\n';
    return content;
};

// Following Class Decomposition strategy found here https://typescript.codeplex.com/wikipage?title=Writing%20Definition%20(.d.ts)%20Files
// This serves two purposes:
//     - enables ambient declaration of class
//     - enables separation of static and instance vars and methods (for the case of Template)
var createDecomposedClass = function(apiDef, tabs) {
    //console.log('Creating decomposed class, longName = ' + longName);
    tabs = tabs || '';
    var classContent = tabs + 'var ' + apiDef.name + ': ' + apiDef.name + 'Static;\n';
    classContent += tabs + 'interface ' + apiDef.name + 'Static {\n';
    var constructorSignature = tabs + '\tnew' + addGenerics(apiDef.longname) + createArgs(apiDef) + ': ' + apiDef.name + addGenerics(apiDef.longname) + ';\n';
    classContent += replaceSignatureElements(constructorSignature);

    // Exception case for Template
    if (apiDef.name === 'Template') {
        classContent += tabs + '\t// It should be [templateName: string]: TemplateInstance but this is not possible -- user will need to cast to TemplateInstance\n' +
                        tabs + '\t[templateName: string]: any | Template; // added "any" to make it work\n' +
                        tabs + '\thead: Template;\n' +
                        tabs + '\tfind(selector:string):Blaze.Template;\n' +
                        tabs + '\tfindAll(selector:string):Blaze.Template[];\n' +
                        tabs + '\t$:any; \n';
    }

    classContent += createModuleInnerContent(apiDef.longname, tabs, true, 'static');
    classContent += tabs + '}\n';
    classContent += tabs + 'interface ' + apiDef.name + addGenerics(apiDef.longname) + ' {\n';
    classContent += createModuleInnerContent(apiDef.longname, tabs, true, 'instance');
    if (apiDef.longname === 'Mongo.Collection') { // Total exception case
        classContent += tabs + '\t_ensureIndex(indexName: string, options?: {[key: string]: any}): void;\n'
    }
    classContent += tabs + '}\n\n';
    return classContent;
};

var createGlobalClasses = function createGlobalClasses() {
    var allClassesContent = '';

    _.each(globalClassNames, function(className) {
        allClassesContent += 'declare ' + createDecomposedClass(DocsData[className], ''); // Global var DocsData created in function runApiFileInThisContext()
    });

    return allClassesContent;
};

var createGlobalFunctions = function createGlobalFunctions() {
    var allFunctionsContent = '';

    _.each(globalFunctionNames, function(functionName) {
        allFunctionsContent += 'declare ' + createFunction(DocsData[functionName], ''); // Global var DocsData created in function runApiFileInThisContext()
    });

    return allFunctionsContent;
};

var createVar = function createVar(apiDef, tabs, isInInterface) {
    var signature = tabs || '';

    if (!isInInterface) signature += 'var ';
    signature += apiDef.name;
    signature += addPropertyOrReturnTypeAndComplete(apiDef.longname, apiDef.returns);
    signature = replaceSignatureElements(signature);    // This is the nuclear option: replace anything missed earlier
    signature += '\n';

    return signature;
};

var createFunction= function createFunction(apiDef, tabs, isInInterface) {
    var signature = tabs || '';

    if (!isInInterface) signature += 'function ';
    signature += apiDef.name;
    signature += addGenerics(apiDef.longname);
    signature += createArgs(apiDef);
    signature += addPropertyOrReturnTypeAndComplete(apiDef.longname, apiDef.returns);
    signature = replaceSignatureElements(signature);    // This is the nuclear option: replace anything missed earlier
    signature += '\n';

    return signature;
};

// Recursively create contents for each module
var createModuleInnerContent = function(moduleOrInterfaceName, tabs, isInterface, scope) {
    //console.log('createModuleInnerContent(), moduleOrInterfaceName = ' + moduleOrInterfaceName);
    tabs = tabs || '';
    var content = '';
    _.forIn(DocsData, function (apiDef) {  // Global var DocsData created in function runApiFileInThisContext()
        if (apiDef.memberof === moduleOrInterfaceName) {
            if (apiDef.longname === 'Template.dynamic') return;  // Special case since it's just for use in templates
            if (scope && apiDef.scope !== scope) return;
            //if (apiDef) console.log('apiDef.longname = ' + apiDef.longname + 'apiDef.scope = ' + apiDef.scope);
            switch (apiDef.kind) {
                case 'namespace':
                    //console.log('Found namespace, longname = ' + apiDef.longname);
                    content += createInnerVar(apiDef);
                    break;
                case 'class':
                    //console.log('Found class, longname = ' + apiDef.longname);
                    content += createDecomposedClass(apiDef, '\t' + tabs);
                    break;
                case 'member':
                    content += createVar(apiDef, '\t' + tabs, isInterface);
                    break;
                case 'function':
                    if (apiDef.longname === 'Tracker.Computation') {  // TODO: better handle special case where function has members
                        content += createSimpleClass(apiDef, '\t' + tabs);
                        break;
                    }
                    content += createFunction(apiDef, '\t' + tabs, isInterface);
                    break;
            }
        }
    });
    return content;
};

var createModules = function() {
    var allModulesContent = '';

    _.each(moduleNames, function(moduleName) {
        var moduleContent = '';
        moduleContent += 'declare module ' + moduleName + ' {\n';
        moduleContent += createModuleInnerContent(moduleName);
        moduleContent += '}\n\n';
        allModulesContent += moduleContent;
    });

    return allModulesContent;
};

var parseClientMeteorApi = function(meteorClientApiFile) {
    runApiFileInThisContext(meteorClientApiFile); // Makes var DocsData in meterClientApiFile accessible as a global var
    var stubFileContent = '';
    stubFileContent += addManuallyMaintainedDefs();
    stubFileContent += createModules();
    stubFileContent += createGlobalClasses();
    stubFileContent += createGlobalFunctions();
    return stubFileContent;
};

var createMeteorDefFile = function() {
    require('request')(METEOR_API_URL, function (error, response, body) {
        if (error || body.length < 10) {
            console.log('Error retrieving data.js from ' + METEOR_API_URL + ': ' + error);
            return;
        }
        writeFileToDisk(SAVED_METEOR_API_FILE_PATH, body);
        populateModuleAndGlobalClassNames(body);
        var meteorDefsContent = parseClientMeteorApi(body);
        writeFileToDisk(DEF_DIR + METEOR_DEF_FILENAME, meteorDefsContent);
    });
};

createMeteorDefFile();
//createTypeScriptLibFile();  Not currently working -- not sure how to generated latest typescript lib.d.ts file
getThirdPartyDefLibs();
getThirdPartyDefTests();

