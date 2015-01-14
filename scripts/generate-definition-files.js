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

var vm = require('vm'),
    fs = require('fs'),
    _ = require('lodash'),
    DEF_DIR = '../definitions/',
    TEST_DIR = '../definition-tests/',
    METEOR_API_URL = 'https://raw.githubusercontent.com//meteor/meteor/devel/docs/client/data.js',
    MANUALLY_MAINTAINED_DEFS_FILE = '../lib/meteor-manually-maintained-definitions.d.ts',
    METEOR_DEF_FILENAME = 'meteor.d.ts',
    DEBUG = true,
    definitionFilenames = [], // References to these files will be written to the master definition file
    testFilenames = ['meteor-tests.ts'],
    moduleNames = [],
    classNames = [];


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
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/googlemaps/google.maps.d.ts',
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
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/node-fibers/node-fibers-tests.ts',
    //'https://github.com/borisyankov/DefinitelyTyped/raw/master/lodash/lodash-tests.ts'
];

var testsWithModuleFlag = ['handlebars-tests.ts', 'node-tests.ts', 'node-fibers-tests.ts'];

// keys are strings that will be sent into new RegExp(<regexp string>)
var argTypeMappings = {
    ': function': ': Function',
    ': MatchPattern': ': any',
    ': String': ': string',
    'clone<T>\\(val: EJSON': 'clone<T>(val: T',
    'Array.<String>': 'string[]',
    'JSONCompatible': 'JSON',
    'Array.<EJSON>': 'EJSON[]',
    'Array.<EJSONable>': 'EJSON[]',
    'DOMElement': 'HTMLElement',
    'DOMNode': 'Node',
    'EventMap': '{[actions: string]: Function}',
    'MongoFieldSpecifier': 'Mongo.FieldSpecifier',
    'Number':'number',
    'Integer': 'number',
    ': Any': ': any',
    'function:': 'func:',
    'renderFunction:': 'renderFunction?:',
    'MongoSelector': 'Mongo.Selector',
    'MongoModifier': 'Mongo.Modifier',
    'MongoSortSpecifier': 'Mongo.SortSpecifier',
    'EJSONable': 'EJSON',
    'null': 'any /** Null **/',
    'undefined': 'any /** Undefined **/',
    'Buffer': 'any /** Buffer **/'
};

var signatureElementMappings = {
    'clone(val: EJSON): T;': 'clone<T>(val:T): T;',
    'fetch();': 'fetch(): Array<T>;',
    'find(selector: any, options?);': 'find(selector?: any, options?): Meteor.Cursor<T>;',
    'findOne(selector: any, options?);': 'findOne(selector?, options?): T;',
    'insert(doc: Object, callback?);': 'insert(doc: T, callback?: Function): string;',
    'subscribe(name: string, arg1, arg2...?: any, callbacks?: any)': 'subscribe(name: string, ...args)',
    'call(name: string, arg1, arg2...?: EJSONable, asyncCallback?: Function)': 'call(name: string, ...args)',
    'function body()': 'body: Meteor.TemplateBase',
    'helpers(helpers: Object)': 'helpers(helpers:{[id:string]: any})',
    'sourcePath?: string, line: number, func: string': 'sourcePath?: string, line?: number, func?: string',
    'function export': '// function export',
    'ReactiveVar(initialValue: any, equalsFunc?: Function)': 'ReactiveVar(initialValue: any, equalsFunc?: (oldVal:any, newVal:any)=>boolean)',
    'Boolean': 'boolean',
    'depends(dependencies: Object)': 'depends(dependencies:{[id:string]:string})',
    'insert?: Function;': 'insert?: (userId:string, doc) => boolean;',
    'update?: Function;': 'update?: (userId, doc, fieldNames, modifier) => boolean;',
    'remove?: Function;': 'remove?: (userId, doc) => boolean;',
    'arg1, arg2...?: any, callbacks?: Function)': '...args)',
    'arg1, arg2...?: any, callbacks?: Object)': '...args)',
    'arg1, arg2...?: EJSON, asyncCallback?: Function)': '...args)',

    'function send(options)': 'function send(options: Email.EmailMessage)',
    'find(selector:': 'find(selector?:',
    'findOne(selector:': 'findOne(selector?:',
    'Collection(name: string,': 'Collection<T>(name: string,'
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
    'Meteor.subscribe': 'SubscriptionHandle',
    'Meteor.apply': 'void',
    'Meteor.call': 'void',
    'Meteor.clearTimeout': 'void',
    'Meteor.clearInterval': 'void',
    'Meteor.disconnect': 'void',
    'Meteor.loggingIn': 'boolean',
    'Meteor.logout': 'void',
    'Meteor.logoutOtherClients': 'void',
    'Meteor.loginWithPassword': 'void',
    'Meteor.loginWith<ExternalService>': 'void',
    'Meteor.methods': 'void',
    //'Meteor.onReconnect': 'void',
    //'Meteor.defer': 'void',
    //'Meteor.render': 'void',
    //'Meteor.renderList': 'void',
    'Meteor.reconnect': 'void',
    'Meteor.setTimeout': 'number',
    'Meteor.setInterval': 'number',
    'Meteor.status': 'Meteor.StatusEnum',
    'Meteor.user': 'Meteor.User',
    'Meteor.users': 'Mongo.Collection<User>',
    'Meteor.userId': 'string',
    'Meteor.onConnection': 'void',
    //'Meteor.withValue': 'void',
    //'Meteor.bindEnvironment': 'Function',
    //'Meteor.get': 'string',
    //'Meteor.EnvironmentVariable': 'void',

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
    'Mongo.Cursor#map': 'void',
    'Mongo.Cursor#observe': 'Meteor.LiveQueryHandle',
    'Mongo.Cursor#observeChanges': 'Meteor.LiveQueryHandle',
    'Plugin.registerSourceHandler': 'void',
    'Package.describe': 'void',
    'Package.onUse': 'void',
    'Package.onTest': 'void',
    'Package.registerBuildPlugin': 'void',
    'Npm.depends': 'void',
    'Npm.require': 'void',
    'Cordova.depends': 'void',
    'Blaze.TemplateInstance#$': 'Node[]',
    'Blaze.TemplateInstance#findAll': 'HTMLElement[]',
    'Blaze.TemplateInstance#find': 'HTMLElement',
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

    'Template#created': 'Function',
    'Template#rendered': 'Function',
    'Template#destroyed': 'Function',
    'Template#events': 'void',
    'Template#helpers': 'void',
    'Template.body': 'Meteor.TemplateBase',
    'Template.instance': 'Blaze.TemplateInstance',
    'Template.currentData': '{}',
    'Template.parentData': '{}',
    'Template.registerHelper': 'void',

    'ReactiveVar#get': 'any',
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

    'DDP.connect': 'DDP.DDPStatic'

    // Some of these below this point may no longer be needed

    //'Random.id': 'string'
};

var createThirdPartyDefLibs = function() {
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
            body = body.replace('../jquery/jquery.d.ts', 'jquery.d.ts');
            body = body.replace('../underscore/underscore.d.ts', 'underscore.d.ts');
            body = body.replace(/path=["'\.\/]+(.+\.d\.ts)["']\s?\/>/g, 'path="../definitions/$1" />');
            writeFileToDisk(TEST_DIR + filename, body);
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

var testThirdPartyDefs = function() {
    _.each(testFilenames, function(filename) {
        console.log('Running transpilation test: ' + filename);
        //var sys = require('sys');
        var exec = require('child_process').exec;
        function displayOutput(error, stdout, stderror) {
            if (stdout) console.log(stdout);
            if (error || stderror) { // Only display one of these to avoid duplication
                if (stderror) {
                    console.log('Error: ' + stderror);
                } else {
                    console.log('Error: ' + error);
                }
            }
        }
        if (_.contains(testsWithModuleFlag, filename)) {
            exec("tsc -m commonjs " + TEST_DIR + filename, displayOutput);
        } else {
            exec("tsc " + TEST_DIR + filename, displayOutput);

        }
    });
};

var replaceIrregularArgTypes = function(argSection) {
    for (var key in argTypeMappings) {
        // Needs to use the RegExp form of replace so can be global in case of multiple arg types
        argSection = argSection.replace(new RegExp(key, 'g'), argTypeMappings[key]);
    }
    return argSection;
};

var replaceSignatureElements = function(funcSignature) {
    for (var key in signatureElementMappings) {
        funcSignature = funcSignature.replace(key, signatureElementMappings[key]);
    }
    return funcSignature;
};

var constructorsTakingGenerics = ['Mongo.Collection', 'Mongo.Cursor'];  // Need to add a generic type to interface definition

var addGenerics = function(longName) {
    if (_.contains(constructorsTakingGenerics, longName)) {
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
        return ': ' + returns[0].type.names[0]
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

var runApiFileInThisContext = function(meteorClientApiFile) {
    vm.runInThisContext("DocsData = {};" + meteorClientApiFile);
};

var hasString = function(haystack, needle) {
    return haystack.indexOf(needle) !== -1;
};

var replaceOptions = function(argSection, options) {
    if (!hasString(argSection, 'options')) return argSection;

    var optionType = '{\n';
    _.each(options, function (option) {
        //if (option.type && option.type.names && option.type.names.length > 1) {
        //    console.log("options = " + JSON.stringify(options));
        //    console.log("types = " + JSON.stringify(option.type.names));
        //}

        if (hasString(option.name, ',')) {     // Special case for App.info, Mongo.Collection#allow, Mongo.Collection#deny
            var optionsArray = option.name.split(',');
            optionsArray.forEach(function(singleOptionName) {
                optionType += '\t\t\t\t' + singleOptionName + '?: ' + option.type.names[0] + ';\n';
            });
        } else {

            optionType += '\t\t\t\t' + option.name + '?: ' + option.type.names[0] + ';\n'
        }
    });
    optionType += '\t\t\t}';


    if (hasString(argSection, 'options?')) {
        argSection = argSection.replace('options?', 'options?: ' + optionType);
    } else {
        argSection = argSection.replace('options', 'options: ' + optionType);
    }

    return argSection;
};

var createArgs = function(apiDef) {
    var argSection = '(';
    _.each(apiDef.params, function(param, index) {
        argSection += param.name;
        if (param.optional) argSection += '?';
        if (param.name !== 'options') {
            if (param.type.names.length > 1) {
                //console.log("Def with multiple types = " + apiDef.longname);
                //console.log('param = ' + param.name + ', types = ' + JSON.stringify(param.type.names));
                argSection += ': any';   // TODO: possibly overload the signature with 1 signature per type -- think this is allowed in TypeScript
            } else {
                argSection += ': ' + param.type.names[0];
            }
        }
        if (index !== apiDef.params.length - 1) argSection += ', ';
    });
    argSection += ')';

    argSection = replaceOptions(argSection, apiDef.options);
    argSection = replaceIrregularArgTypes(argSection);

    return argSection;
};

// It appears that apiDef.kind can be namespace, class, member, or function (but namespaces are not passed into this function)
var createSignature = function(apiDef, tabs, isInInterface) {
    var signature = tabs || '';

    if (apiDef.kind === 'function' || isInInterface || apiDef.kind === 'class') {
        if (!isInInterface) signature += 'function ';
        signature += apiDef.name;
        signature += addGenerics(apiDef.longname);
        signature += createArgs(apiDef);
    } else if (apiDef.kind === 'member') {
        signature += 'var ' + apiDef.name;
        if (apiDef.types && apiDef.types.names) {
            if (apiDef.types.names.length > 1) {  // This situation doesn't currently exist, but I suppose it could exist in the future
                signature += ': any;';   // TODO: possibly overload the signature with 1 signature per type -- think this is allowed in TypeScript
            } else {
                signature += ': ' + apiDef.types.names[0] + ';';
            }
        }
    } else {
        console.log('No "kind" property found: ' + JSON.stringify(apiDef, null, 4));
    }

    if (apiDef.kind === 'class') {
        signature += ': void;';    // since this will be a constructor and constructors in TypeScript must always have a void return type
    } else {
        signature += addPropertyOrReturnTypeAndComplete(apiDef.longname, apiDef.returns);
    }
    signature = replaceSignatureElements(signature);    // This is the nuclear option: replace anything missed earlier
    signature += '\n';

    return signature;
};

var populateModuleAndClassNames = function(meteorClientApiFile) {
    runApiFileInThisContext(meteorClientApiFile);
    _.forIn(DocsData, function (value, key) {
        if (value.kind === 'namespace' && !value.memberof) {
            moduleNames.push(key);
        }
        if (value.kind === 'class' && !value.memberof) {
            classNames.push(key);
        }
    });
    //moduleNames.push('Template'); // TODO: fix exception
    moduleNames.push('Session'); // TODO: fix exception
    moduleNames.push('HTTP'); // TODO: fix exception
    moduleNames.push('Email'); // TODO: fix exception
    //moduleNames.push('ReactiveVar'); // TODO: fix exception
    moduleNames = _.filter(moduleNames, function(modName) {
        return modName !== 'Plugin';
    });
    console.log('Modules: ' + JSON.stringify(moduleNames));
    console.log('Classes: ' + JSON.stringify(classNames));

};

var findParamsWithMultipleTypes = function(apiDef) {
    var paramsWithMultipleTypes = [];
    _.each(apiDef.params, function(param, index) {
        if (param.type.names.length > 1) {
            //console.log("Def with multiple types = " + apiDef.longname + ', param = ' + param.name + ', types = ' + JSON.stringify(param.type.names));
            paramsWithMultipleTypes.push(index);
        }
    });
    return paramsWithMultipleTypes;
};

// Recursively create contents for each module
var createModuleInnerContent = function(moduleName, apiDoc, tabs, isInterface) {
    tabs = tabs || '';
    var content = '';
    _.forIn(apiDoc, function (apiDef) {
        if (apiDef.memberof === moduleName) {
            if (apiDef.longname === 'Template.dynamic') return;  // Special case since it's just for use in templates
            if (apiDef.kind === 'namespace') {
                content += '\tvar ' + apiDef.name + ': {\n';
                content += '\t' + createModuleInnerContent(apiDef.longname, apiDoc, '', true);
                content += '\t};\n';
            } else {  // apiDef.kind === members, functions, and classes
                var paramIndexes = findParamsWithMultipleTypes(apiDef);

                if (paramIndexes.length > 0) {
                    var originalApiDef = JSON.parse(JSON.stringify(apiDef));

                    // start section to make recursive
                    _.each(apiDef.params, function(param1, paramIndex1) {
                        if (paramIndex1 === paramIndexes[0]) {
                            _.each(param1.type.names, function(type1) {
                                apiDef.params[paramIndex1].type.names = [type1];
                                if (paramIndexes[1]) {
                                    _.each(originalApiDef.params, function(param2, paramIndex2) {

                                        _.each(param2.type.names, function(type2) {
                                            if (paramIndex2 === paramIndexes[1]) {
                                                apiDef.params[paramIndex2].type.names = [type2];
                                                content += createSignature(apiDef, '\t' + tabs, isInterface);
                                            }
                                        });

                                    });
                                } else {
                                    content += createSignature(apiDef, '\t' + tabs, isInterface);
                                }
                            });
                        }
                    });
                    // end section to make recursive

                    //content += createSignature(apiDef, '\t' + tabs, isInterface);
                } else {
                    content += createSignature(apiDef, '\t' + tabs, isInterface);
                }
            }
            // Special cases
            if (apiDef.longname === 'Mongo.Collection' || apiDef.longname === 'Mongo.Cursor'
                || apiDef.longname === 'Tracker.Computation' || apiDef.longname === 'Tracker.Dependency'
                || apiDef.longname === 'Blaze.TemplateInstance' || apiDef.longname === 'EJSON.CustomType') {
                content += '\tinterface ' + apiDef.name;
                if (apiDef.longname === 'Mongo.Collection' || apiDef.longname === 'Mongo.Cursor') content += '<T>';
                content += ' {\n\t' + createModuleInnerContent(apiDef.longname, apiDoc, '\t', true);
                content += '\t}\n\n'
            }
        }
    });
    return content;
};

var parseClientMeteorApi = function(meteorClientApiFile) {
    runApiFileInThisContext(meteorClientApiFile);
    var stubFileContent = '';
    stubFileContent += addManuallyMaintainedDefs();

    _.each(moduleNames, function(moduleName) {
        var moduleContent = '';
        moduleContent += 'declare module ' + moduleName + ' {\n';
        moduleContent += createModuleInnerContent(moduleName, DocsData);  //DocsData is root element within meteorClientApiFile
        moduleContent += '}\n\n';
        stubFileContent += moduleContent;
    });

    // Classes are separated out since they need a constructor, and we may want to define them as
    // interfaces instead of modules in the future
    _.each(classNames, function(className) {
        var classContent = 'declare ' + createSignature(DocsData[className], '', false);
        classContent += 'declare module ' + className + ' {\n';
        classContent += createModuleInnerContent(className, DocsData); //DocsData is root element meteorClientApiFile
        classContent += '}\n\n';
        stubFileContent += classContent;
    });

    return stubFileContent;
};

var createMeteorDefFile = function() {
    require('request')(METEOR_API_URL, function (error, response, body) {
        populateModuleAndClassNames(body);
        var meteorDefsContent = parseClientMeteorApi(body);
        writeFileToDisk(DEF_DIR + METEOR_DEF_FILENAME, meteorDefsContent);
    });
};

createMeteorDefFile();
//createTypeScriptLibFile();  Not currently working -- not sure how to generated latest typescript lib.d.ts file
createThirdPartyDefLibs();
getThirdPartyDefTests();
setTimeout(testThirdPartyDefs, 8000);
//setTimeout(createMasterDefFile, 10000);