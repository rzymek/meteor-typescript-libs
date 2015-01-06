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
    DEF_DIR = '../',
    TEST_DIR = '../definition-tests/',
    METEOR_API_URL = 'https://raw.githubusercontent.com//meteor/meteor/devel/docs/client/data.js',
    MANUALLY_MAINTAINED_DEFS_FILE = '../lib/meteor-manually-maintained-definitions.d.ts',
    METEOR_DEF_FILENAME = 'meteor.d.ts',
    DEBUG = true;

var definitionFilenames = []; // References to these files will be written to the master definition file
var testFilenames = ['meteor-tests.ts'];

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

var thirdPartyDefLibs = [
    'https://github.com/borisyankov/DefinitelyTyped/tree/master/mongodb/mongodb.d.ts',
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
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/lodash/lodash.d.ts'
];

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
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/lodash/lodash-tests.ts'
];

var testsWithModuleFlag = ['handlebars-tests.ts', 'node-tests.ts', 'node-fibers-tests.ts'];

var getThirdPartyDefTests = function() {
    _.each(thirdPartyDefTests, function(test) {
        require('request')(test, function(error, response, body) {
            var filename = test.slice(test.lastIndexOf('/') + 1);
            testFilenames.push(filename);
            body = body.replace('../jquery/jquery.d.ts', 'jquery.d.ts');
            body = body.replace('../underscore/underscore.d.ts', 'underscore.d.ts');
            body = body.replace(/path=["'\.\/]+(.+\.d\.ts)["']\s?\/>/g, 'path="../$1" />');
            writeFileToDisk(TEST_DIR + filename, body);
        })
    });
};

var testThirdPartyDefs = function() {
    _.each(testFilenames, function(filename) {
        console.log('Running transpilation test: ' + filename);
        var sys = require('sys')
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

    // Not sure if anything below is necessary
    ': Any': ': any',
    ': anything': ': any',
    ': EJSON-compatible value': ': EJSON',
    ': EJSON-compatible object': ': Meteor.EJSONObject',
    ': Template': ': Blaze.Template',
    ': Rendered template object': ': Meteor.RenderedTemplate',
    ': object': ': Object',
    ': JSON-compatible value': ': JSON',
    ': Mongo modifier': ': any',
    ': Match pattern': ': any',
    ': Array of Strings': ': string[]',
    ': Array of String': ': string[]',
    ': Boolean, Integer, or String;': ': any; // boolean, integer, or string',
    ': Sort specifier': ': any',
    ': Field specifier': ': Mongo.CollectionFieldSpecifier',
    ': Event map': ': {[id:string]: Function}',
    ': DOM Element': ': HTMLElement',
    ': DOM Node': ': Node',
    '\\.\\.\\.args.+\\)': '...args)',
    '\\.\\.\\.params.+\\)': '...params)',
    ': String or Function;': ': any; // string or Function',
    ': String or Array of strings;': ': any; // string or string[]',
    '\\{(.|[\r\n])+insert, update, remove(.|[\r\n])+\\}': 'Meteor.AllowDenyOptions',

    'function:': 'func:',
    'Number':'number',
    'Integer': 'number',
    ': View': ': Blaze.View',

    // Argument and type parings
    'callback\\?\\)': 'callback?: Function)',
    'renderFunction: Function': 'renderFunction?: Function',
    'idGeneration\\?: string': 'idGeneration?: Mongo.CollectionIdGenerationEnum',
    'transform\\?: Function': 'transform?: (document)=>any'
};

var replaceIrregularArgTypes = function(argSection) {
    for (var key in argTypeMappings) {
        argSection = argSection.replace(new RegExp(key, 'g'), argTypeMappings[key]);
    }
    return argSection;
};

var interfacesTakingGenerics = ['Mongo.Collection', 'Mongo.Cursor'];  // Need to add a generic type to interface definition

var takesGeneric = function(longName) {
    return (_.contains(interfacesTakingGenerics, longName));
};

var signatureElementMappings = {
    'clone(val: EJSON);': 'clone<T>(val:T): T;',
    'fetch();': 'fetch(): Array<T>;',
    'find(selector: any, options?);': 'find(selector?: any, options?): Meteor.Cursor<T>;',
    'findOne(selector: any, options?);': 'findOne(selector?, options?): T;',
    'insert(doc: Object, callback?);': 'insert(doc: T, callback?: Function): string;',
    'subscribe(name: string, arg1, arg2...?: any, callbacks?: any)': 'subscribe(name: string, ...args)',
    'call(name: string, arg1, arg2...?: EJSONable, asyncCallback?: Function)': 'call(name: string, ...args)',
    'function body()': 'body: Meteor.TemplateBase',
    'helpers(helpers: Object)': 'helpers(helpers:{[id:string]: any})',

    'function send(options)': 'function send(options: Email.EmailMessage)',
    'find(selector:': 'find(selector?:',
    'findOne(selector:': 'findOne(selector?:',
    'Collection(name: string,': 'Collection<T>(name: string,'
};

var replaceSignatureElements = function(funcSignature) {
    for (var key in signatureElementMappings) {
        funcSignature = funcSignature.replace(key, signatureElementMappings[key]);
    }
    return funcSignature;
};

var addGenerics = function(longName) {
    if (takesGeneric(longName)) {
        return '<T>';
    } else {
        return '';
    }
};

var functionReturnValues = {
    'Mongo.Collection#find': 'Mongo.Cursor<T>',
    'Mongo.Collection#findOne': 'EJSON',
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

    // Some of these below this point may no longer be needed
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
    'Meteor.onReconnect': 'void',
    'Meteor.defer': 'void',
    'Meteor.render': 'void',
    'Meteor.renderList': 'void',
    'Meteor.reconnect': 'void',
    'Meteor.setTimeout': 'number',
    'Meteor.setInterval': 'number',
    'Meteor.status': 'Meteor.StatusEnum',
    'Meteor.user': 'Meteor.User',
    'Meteor.users': 'Mongo.Collection<User>',
    'Meteor.userId': 'string',
    'Meteor.onConnection': 'void',
    'Meteor.withValue': 'void',
    'Meteor.bindEnvironment': 'Function',
    'Meteor.get': 'string',
    'Meteor.EnvironmentVariable': 'void',

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
    'Tracker.Dependency#depend': 'boolean',
    'Tracker.Dependency#changed': 'void',
    'Tracker.Dependency#hasDependents': 'boolean',

    'HTTP.call': 'HTTP.HTTPResponse',
    'HTTP.get': 'HTTP.HTTPResponse',
    'HTTP.post': 'HTTP.HTTPResponse',
    'HTTP.put': 'HTTP.HTTPResponse',
    'HTTP.del': 'HTTP.HTTPResponse',
    'Email.send': 'void',
    'Assets.getText': 'string',
    'Assets.getBinary': 'EJSON',
    'Match.test': 'boolean',
    'DDP.connect': 'DDP.DDPStatic',
    'Session.set': 'void',
    'Session.setDefault': 'void',
    'Session.get': 'any',
    'Session.equals': 'boolean',
    'Random.id': 'string'

};

var createReturnTypeAndComplete = function(longName, returns) {
    var returnValue = functionReturnValues[longName];
    if (returnValue && returnValue.length !== 0) {
        return ': ' + returnValue + ';';
    }
    if (returns && returns[0] && returns[0].type) {
        return ': ' + returns[0].type.names[0]
    }

    return DEBUG ? '; /** TODO: add return value **/' : ';';

    //if (DEBUG) {
    //    return '; /** TODO: add return value **/';
    //} else {
    //    return ';'
    //}
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

var modulesAndInterfaces = [];  // module or interface names

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
        if (option.name.indexOf(',') > -1) {     // Special case for App.info, Mongo.Collection#allow, Mongo.Collection#deny
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

// It appears that def.kind can be namespace, class, member, or function (but namespaces are not passed into this function)
var createSignature = function(def, isInInterface) {
    var signature = '\t';

    if (def.kind === 'function' || isInInterface || def.kind === 'class') {
        if (!isInInterface) signature += 'function ';
        signature += def.name;
        signature += addGenerics(def.longname);
        signature += createArgs(def);
    } else if (def.kind === 'member') {
        signature += 'var ' + def.name;
        if (def.types && def.types.names) {
            if (def.types.names.length > 1) {
                signature += ': any;';   // TODO: possibly overload the signature with 1 signature per type -- think this is allowed in TypeScript
            } else {
                signature += ': ' + def.types.names[0] + ';';
            }
        }
    } else {
        console.log('No "kind" property found: ' + JSON.stringify(def, null, 4));
    }

    if (def.kind === 'class') {
        signature += ': void;';    // since this will be a constructor and constructors in TypeScript must always have a void return type
    } else {
        signature += createReturnTypeAndComplete(def.longname, def.returns);
    }
    signature = replaceSignatureElements(signature);    // This is the nuclear option: replace the entire signature
    signature += '\n';

    return signature;
};

var populateModuleOrInterfaceNames = function(meteorClientApiFile) {
    runApiFileInThisContext(meteorClientApiFile);
    _.forIn(DocsData, function (value, key) {
        if (value.kind === 'namespace' && !value.memberof) {
            modulesAndInterfaces.push(key);
        }
    });
    modulesAndInterfaces.push('Template'); // TODO: fix exception
    modulesAndInterfaces.push('Session'); // TODO: fix exception
    modulesAndInterfaces.push('HTTP'); // TODO: fix exception
    modulesAndInterfaces.push('Email'); // TODO: fix exception
    modulesAndInterfaces.push('ReactiveVar'); // TODO: fix exception
    modulesAndInterfaces = _.filter(modulesAndInterfaces, function(modName) {
        return modName !== 'Plugin';
    });
    console.log('Modules: ' + JSON.stringify(modulesAndInterfaces));
};

// Recursively create contents for each module
var createModuleInnerContent = function(moduleName, apiDoc, tabs, isInterface) {
    var content = '';
    _.forIn(apiDoc, function (value) {
        if (value.memberof === moduleName) {
            if (value.longname === 'Template.dynamic') return;  // Special case since it's just for use in templates
            if (value.kind === 'namespace') {
                content += '\tvar ' + value.name + ': {\n';
                content += '\t' + createModuleInnerContent(value.longname, apiDoc, '', true);
                content += '\t};\n';
            } else {  // value.kind === members, functions, and classes
                if (value.kind === 'class') {
                    console.log('class longname = ' + value.longname);
                }
                content += tabs ? tabs + createSignature(value, isInterface) : createSignature(value, isInterface);
            }
            // Special cases
            if (value.longname === 'Mongo.Collection' || value.longname === 'Mongo.Cursor'
                || value.longname === 'Tracker.Computation' || value.longname === 'Tracker.Dependency'
                || value.longname === 'Blaze.TemplateInstance' || value.longname === 'EJSON.CustomType') {
                content += '\tinterface ' + value.name;
                if (value.longname === 'Mongo.Collection' || value.longname === 'Mongo.Cursor') content += '<T>';
                content += ' {\n\t' + createModuleInnerContent(value.longname, apiDoc, '\t', true);
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

    _.each(modulesAndInterfaces, function(moduleName) {
        var moduleContent = '';
        moduleContent += 'declare module ' + moduleName + ' {\n';
        moduleContent += createModuleInnerContent(moduleName, DocsData);
        moduleContent += '}\n\n';
        stubFileContent += moduleContent;
    });

    return stubFileContent;
};

var createMeteorDefFile = function() {
    require('request')(METEOR_API_URL, function (error, response, body) {
        populateModuleOrInterfaceNames(body);
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