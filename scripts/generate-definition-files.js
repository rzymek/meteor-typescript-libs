/**
 * This script downloads the third part typescript definitions, generates "meteor.d.ts" from
 * the meteor api.js file (on github), and creates "all-definitions.d.ts", which has references
 * to all of the typescript definition files.
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
    METEOR_API_URL = 'https://raw.githubusercontent.com//meteor/meteor/devel/docs/client/api.js',
    MANUALLY_MAINTAINED_DEFS_FILE = '../lib/meteor-manually-maintained-definitions.d.ts',
    GLOBAL_VAR_DEFS = '../lib/meteor-global-var-declarations.d.ts',
    METEOR_DEF_FILENAME = 'meteor.d.ts',
    DEBUG = false;

var definitionFilenames = []; // References to these files will be written to the master definition file
var testFilenames = ['meteor-tests.ts'];

// Not currently used -- not sure how to automatically generate latest lib.d.ts
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
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/underscore/underscore-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/underscore.string/underscore.string-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/jquery/jquery-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/backbone/backbone-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/bootstrap/bootstrap-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/d3/d3-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/handlebars/handlebars-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/node/node-tests.ts',
    'https://github.com/borisyankov/DefinitelyTyped/raw/master/node-fibers/node-fibers-tests.ts'
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

var argNameMappings = {
    '\\s*\\[,\\s': ', ',  //e.g. Meteor.subscribe(name [, arg1, arg2, ... ] [, callbacks])
    '\\[': '',  //e.g. Meteor.absoluteUrl([path], [options])
    '\\s\\]': '?',
    '\\]': '?',
    'arg1, arg2, ...': '...args',
    'param1, param2, ...': '...params',
    'Template.<em>myTemplate</em>': 'template'
};

var replaceIrregularArgNames = function(argSection) {
    for (var key in argNameMappings) {
        argSection = argSection.replace(new RegExp(key, 'g'), argNameMappings[key]);
    }
    return argSection;
};

// keys are strings that will be sent into new RegExp(<regexp string>)
var argTypeMappings = {
    ': function': ': Function',
    ': Any': ': any',
    ': anything': ': any',
    ': EJSON-compatible value': ': Meteor.EJSON',
    ': EJSON-compatible object': ': Meteor.EJSONObject',
    ': Template': ': Meteor.CreatedTemplate',
    ': Rendered template object': ': RenderedTemplate',
    ': object': ': Object',
    ': JSON-compatible value': ': JSON',
    ': Mongo modifier': ': any',
    ': Match pattern': ': any',
    ': Array of Strings': ': string[]',
    ': Array of String': ': string[]',
    ': Boolean, Integer, or String;': ': any; // boolean, integer, or string',
    ': Sort specifier': ': any',
    ': Field specifier': ': Meteor.CollectionFieldSpecifier',
    ': Event map': ': {[id:string]: Function}',
    ': DOM Element': ': HTMLElement',
    ': DOM Node': ': Node',
    '\\.\\.\\.args.+\\)': '...args)',
    '\\.\\.\\.params.+\\)': '...params)',
    ': String or Function;': ': any; // string or Function',
    ': String or Array of strings;': ': any; // string or string[]',
    ': String': ': string',
    '\\{(.|[\r\n])+insert, update, remove(.|[\r\n])+\\}': 'Meteor.AllowDenyOptions',

    'function:': 'func:',

    // Argument and type parings
    'callback\\?\\)': 'callback?: Function)'
};

var replaceIrregularArgTypes = function(argSection) {
    for (var key in argTypeMappings) {
        argSection = argSection.replace(new RegExp(key, 'g'), argTypeMappings[key]);
    }
    return argSection;
};

var functionsWithGenericsMappings = {
    'clone(val: Meteor.EJSON);': 'clone<T>(v:T): T;',
    'fetch();': 'fetch(): Array<T>;',
    'find(selector: any, options?);': 'find(selector?: any, options?): Meteor.Cursor<T>;',
    'findOne(selector: any, options?);': 'findOne(selector?, options?): T;',
    'insert(doc: Object, callback?);': 'insert(doc: T, callback?: Function): string;',

    'function send(options)': 'function send(options: Email.EmailMessage)',
    'find(selector:': 'find(selector?:',
    'findOne(selector:': 'findOne(selector?:'
};

var replaceSignaturesWithGenerics = function(funcSignature) {
    for (var key in functionsWithGenericsMappings) {
        funcSignature = funcSignature.replace(key, functionsWithGenericsMappings[key]);
    }
    return funcSignature;
};

var interfaceExtensionMappings = {
    'Accounts': 'Meteor.AccountsBase',
    'Match': 'Meteor.MatchBase'
};

var getGenericDeclaration = function(moduleOrInterface) {
    if (takesGeneric(moduleOrInterface)) {
        return '<T>';
    } else {
        return '';
    }
};

var getInterfaceExtensions = function(interfaceOrModule) {
    var extensionText = '';
    if (interfaceExtensionMappings[interfaceOrModule]) {
        extensionText += ' extends ' + interfaceExtensionMappings[interfaceOrModule];
    }
    return extensionText;
};

var functionReturnValues = {
    'Meteor.isClient': 'boolean',
    'Meteor.isServer': 'boolean',
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
    'Meteor.loginWithExternalService': 'void',
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
    'Meteor.users': 'Meteor.Collection<User>',
    'Meteor.userId': 'string',
    'Meteor.onConnection': 'void',
    'Meteor.Collection': 'void',
    'Meteor.withValue': 'void',
    'Meteor.bindEnvironment': 'Function',
    'Meteor.Error': 'void',   'Meteor.get': 'string',
    'Meteor.EnvironmentVariable': 'void',
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
    'Collection.update': 'number',
    'Collection.upsert': '{numberAffected?: number; insertedId?: string;}',
    'Collection.remove': 'void',
    'Collection.allow': 'boolean',
    'Collection.deny': 'boolean',
    'Collection.ObjectID': 'Object',
    'Cursor.forEach': 'void',
    'Cursor.map': 'void',
    'Cursor.count': 'number',
    'Cursor.observe': 'Meteor.LiveQueryHandle',
    'Cursor.observeChanges': 'Meteor.LiveQueryHandle',
    'Deps.flush': 'void',
    'Deps.nonreactive': 'void',
    'Deps.active': 'boolean',
    'Deps.currentComputation': 'Deps.Computation',
    'Deps.onInvalidate': 'void',
    'Deps.afterFlush': 'void',
    'Deps.autorun': 'Deps.Computation',
    'Computation.stop': 'void',
    'Computation.invalidate': 'void',
    'Computation.onInvalidate': 'void',
    'Computation.stopped': 'boolean',
    'Computation.invalidated': 'boolean',
    'Computation.firstRun': 'boolean',
    'Dependency.depend': 'boolean',
    'Dependency.changed': 'void',
    'Dependency.hasDependents': 'boolean',
    'EJSON.parse': 'EJSON',
    'EJSON.stringify': 'string',
    'EJSON.fromJSONValue': 'any',
    'EJSON.toJSONValue': 'JSON',
    'EJSON.equals': 'boolean',
    'EJSON.newBinary': 'any',
    'EJSON.isBinary': 'boolean',
    'EJSON.addType': 'void',
    'HTTP.call': 'HTTP.HTTPResponse',
    'HTTP.get': 'HTTP.HTTPResponse',
    'HTTP.post': 'HTTP.HTTPResponse',
    'HTTP.put': 'HTTP.HTTPResponse',
    'HTTP.del': 'HTTP.HTTPResponse',
    'Email.send': 'void',
    'Assets.getText': 'string',
    'Assets.getBinary': 'Meteor.EJSON',
    'Template.rendered': 'Function',
    'Template.created': 'Function',
    'Template.destroyed': 'Function',
    'Template.events': 'void',
    'Template.helpers': 'void',
    'UI.registerHelper': 'void',
    'UI.body': 'Meteor.Template',
    'UI.render': 'Meteor.RenderedTemplate',
    'UI.renderWithData': 'Meteor.RenderedTemplate',
    'UI.insert': 'void',
    'UI.remove': 'void',
    'UI.getElementData': 'Meteor.DataContext',
    'Match.test': 'boolean',
    'DDP.connect': 'DDP.DDPStatic',
    'Session.set': 'void',
    'Session.setDefault': 'void',
    'Session.get': 'any',
    'Session.equals': 'boolean',
    'Random.id': 'string'
};

var createReturnType = function(canonicalName) {
    var methodNameId = getModuleOrInterfaceName(canonicalName) + '.' + getPropertyName(canonicalName);
    if (functionReturnValues[methodNameId] && functionReturnValues[methodNameId].length !== 0) {
        return ': ' + functionReturnValues[methodNameId] + ';\n';
    } else {
        if (DEBUG) {
            return '; /** TODO: add return value **/\n';
        } else {
            return '; \n'
        }
    }
};

var modules = ['Meteor', 'Deps', 'HTTP', 'Email', 'DDP', 'Assets', 'Random']; // Make these wrappers modules and not interfaces

var interfacesTakingGenerics = ['Collection', 'Cursor'];  // Need to add a generic type to interface definition

var takesGeneric = function(wrapperName) {
    return (_.contains(interfacesTakingGenerics, wrapperName));
};

var writeFileToDisk = function(path, content) {
    if (DEBUG) {
        console.log(content);
        return;
    }
    fs.writeFile(path, content, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('File written to ' + path);
        }
    });
};

var createMasterDefFile = function() {
    var body = fs.readFileSync('../lib/all-definitions-top.d.ts');
    body += '\n';

    _.each(definitionFilenames, function(filename) {
       body += '/// <reference path="' + filename + '" />\n';
    });

    writeFileToDisk('../all-definitions.d.ts', body);
};

var addManuallyMaintainedDefs = function() {
    var interfaces = fs.readFileSync(MANUALLY_MAINTAINED_DEFS_FILE);
    interfaces += '\n';
    return interfaces;
};

var addGlobalVars = function() {
    var globalVars = fs.readFileSync(GLOBAL_VAR_DEFS);
    return globalVars;
};

var modulesAndInterfaces = [];  // module or interface names
var ignoredPrefixes = [];

var runApiFileInThisContext = function(meteorClientApiFile) {
    vm.runInThisContext("Template = { api: {} }; Meteor = {};" + meteorClientApiFile);
}

var hasString = function(haystack, needle) {
    return haystack.indexOf(needle) !== -1;
};

// inclusive of start and end
var sliceRegEx = function (haystack, start, end) {
    if (!haystack) return '';

    var startPos = haystack.search(start);
    if (startPos < 0) return '';

    haystack = haystack.slice(startPos);
    if (!end) return haystack;

    var endPos = haystack.search(end);
    if (endPos < 0) return haystack;

    return haystack.slice(0, endPos + 1);
};

var removeHTML = function(name) {
    name = name.replace(/\<\/?\w+\>/g, '');  //e.g. Meteor.loginWith<i>ExternalService</i>([options], [callback])
    return name;
};

function hasBracket(str) {
    return str.indexOf('(') !== -1;
}

var adjustCanonicalName = function(canonicalName) {
    canonicalName = removeHTML(canonicalName);
    canonicalName = canonicalName.replace('new Meteor.Collection.', 'Collection.');
    canonicalName = canonicalName.replace('Template.myTemplate.', 'Template.');
    return canonicalName;
};

function getModuleOrInterfaceName(canonicalName) {
    canonicalName = adjustCanonicalName(canonicalName);

    var moduleName = canonicalName.substring(0, canonicalName.indexOf('.'));
    moduleName = moduleName[0].toUpperCase() + moduleName.substring(1);
    moduleName = moduleName.replace('New Meteor','Meteor');
    moduleName = moduleName.replace('Env_var','Meteor');
    return moduleName;
}

var isDefinable = function(canonicalName) {
    if (hasString(canonicalName, '{{')) return false;
    return hasString(canonicalName, '.');
};

var isNotFunction = function(canonicalName) {
    return (hasString(canonicalName, ' = function') || !hasString(canonicalName, '('));
};

var getPropertyName = function(canonicalName) {
    canonicalName = adjustCanonicalName(canonicalName);

    var methodNameStartPos = canonicalName.indexOf('.') + 1;
    if (hasBracket(canonicalName)) {
        var methodNameEndPos = canonicalName.search(/\s=|\(/);
    } else {
        var methodNameEndPos = canonicalName.length;
    }
    return canonicalName.substring(methodNameStartPos, methodNameEndPos);
};

var getFullyQualifiedName = function(canonicalName) {
    return getModuleOrInterfaceName(canonicalName) + '.' + getPropertyName(canonicalName);
};

var isModule = function(wrapperName) {
    return (_.contains(modules, wrapperName));
};

var isDepsModule = function(moduleOrInterface) {
    if (moduleOrInterface.indexOf('Computation') === 0) {
        return true;
    }
    if (moduleOrInterface.indexOf('Dependency') === 0) {
        return true;
    }
    return false;
};

var addArgTypes = function(arg, argSection) {
    var argType =hasString(arg.type, ' or ') ? 'any' : arg.type;
    if (hasString(argSection, arg.name + '?')) {
        argSection = argSection.replace(arg.name + '?', arg.name + ': ' + argType);
    } else {
        argSection = argSection.replace(arg.name + ')', arg.name + ': ' + argType + ')');
        argSection = argSection.replace(arg.name + ',', arg.name + ': ' + argType + ',');
    }
    return argSection;
};

var replaceOptions = function(argSection, apiDef) {
    if (!hasString(argSection, 'options')) return argSection;

    var optionType = '{\n';
    _.each(apiDef.options, function(options) {
        optionType += '\t\t\t\t\t' + options.name + '?: ' + options.type + ';\n'
    });
    optionType += '\t\t\t\t}';

    if (hasString(argSection, 'options?')) {
        argSection = argSection.replace('options?', 'options?: ' + optionType);
    } else {
        argSection = argSection.replace('options', 'options: ' + optionType);
    }
    return argSection;
};

var createArgs = function(apiDef) {
    var argSection = sliceRegEx(apiDef.name, /\(/, /\)/);
    if (!argSection || argSection.length < 4) return '()';

    _.each(apiDef.args, function(arg) {
        argSection = addArgTypes(arg, argSection);
    });
    argSection = replaceIrregularArgNames(argSection);
    argSection = replaceOptions(argSection, apiDef);
    argSection = replaceIrregularArgTypes(argSection);
    return argSection;
};

var getTabs = function(minTabs) {
    var tabs = '';
    var i = 0;
    while (i < minTabs) {
        tabs += '\t';
        i++;
    }
    return tabs;
};

var createSingleSignature = function(moduleOrInterface, methodName, apiDef, minTabs) {
    var signature = '';
    if (methodName.indexOf('.') !== -1) {
        var outerFunc = methodName.split('.')[0];
        signature += getTabs(minTabs);
        signature += outerFunc + ': {\n';
        var shorterMethodName = methodName.slice(methodName.indexOf('.') + 1);
        signature += createSingleSignature(moduleOrInterface, shorterMethodName, apiDef, minTabs + 1);
        signature += getTabs(minTabs);
        signature += '}\n';
        return signature;
    }

    signature += getTabs(minTabs);
    if (isNotFunction(apiDef.name)) {
        if (isModule(moduleOrInterface)) signature += 'var ';
        signature += methodName;
        signature += createReturnType(apiDef.name);
        return signature;
    }
    if (isModule(moduleOrInterface)) signature += 'function ';
    signature += methodName;
    signature += createArgs(apiDef);
    signature += createReturnType(apiDef.name);
    return signature;
};

var createSignatures = function(moduleOrInterface, defs) {
    var signatures = '';
    _.each(defs, function(singleDef) {
        var methodName = getPropertyName(singleDef.name);
        var minTabs = isModule(moduleOrInterface) ? 1 : 2;
        var singleSignature = createSingleSignature(moduleOrInterface, methodName, singleDef, minTabs);
        singleSignature = replaceSignaturesWithGenerics(singleSignature);
        signatures += singleSignature;
    });
    return signatures;
};

var _toArrayOfDefs = function(apiDefinition) {
    if (hasString(apiDefinition.name, ' and ')) {
        var defNames = apiDefinition.name.split(' and ');
        var def1 = _.cloneDeep(apiDefinition);
        def1.name = defNames[0];
        var def2 = _.cloneDeep(apiDefinition);
        def2.name = defNames[1];
        var defs = [def1, def2]
    } else {
        var defs = [apiDefinition];
    }
    return defs;
};

var isIgnoredDefinition = function(preface) {
    if (hasString(preface, '{{') ||
            preface === 'This' ||
            preface === 'Instance') {
        return true;
    } else {
        return false;
    }
};

var populateModuleOrInterfaceNames = function(meteorClientApiFile) {
    runApiFileInThisContext(meteorClientApiFile);
    _.forIn(Template.api, function (apiDefinition) {
        if (!isDefinable(apiDefinition.name)) return;
        var moduleOrInterfaceName = getModuleOrInterfaceName(apiDefinition.name);
        if (isIgnoredDefinition(moduleOrInterfaceName)) {
            if (!_.contains(ignoredPrefixes, moduleOrInterfaceName)) {
                ignoredPrefixes.push(moduleOrInterfaceName);
            }
            return;
        }
        if (!_.contains(modulesAndInterfaces, moduleOrInterfaceName)) {
            modulesAndInterfaces.push(moduleOrInterfaceName);
        }

    });
};

var parseClientMeteorApi = function(meteorClientApiFile) {
    runApiFileInThisContext(meteorClientApiFile);
    var stubFileContent = '';
    stubFileContent += addManuallyMaintainedDefs();

    _.each(modulesAndInterfaces, function(moduleOrInterface) {
        if (isModule(moduleOrInterface)) {
            stubFileContent += 'declare module ' + moduleOrInterface + ' {\n';
        } else {
            if (isDepsModule(moduleOrInterface)) {
                stubFileContent += 'declare module Deps {\n';
            } else {
                stubFileContent += 'declare module Meteor {\n';
            }
            stubFileContent += '\tinterface ' + moduleOrInterface;
            stubFileContent += getGenericDeclaration(moduleOrInterface);
            stubFileContent += getInterfaceExtensions(moduleOrInterface);
            stubFileContent += ' {\n';
        }

        _.forIn(Template.api, function (apiDefinition) {
            if (!apiDefinition.name || !isDefinable(apiDefinition.name)) return;

            var moduleName = getModuleOrInterfaceName(apiDefinition.name);
            if (moduleName !== moduleOrInterface) return;

            var defs = _toArrayOfDefs(apiDefinition);  //since some names really have 2 definitions -- bummer
            stubFileContent += createSignatures(moduleOrInterface, defs);
        });
        if (!isModule(moduleOrInterface)) stubFileContent += '\t}\n';
        stubFileContent += '}\n';
        stubFileContent += '\n';
    });

    stubFileContent += addGlobalVars();
    console.log('Modules and Interfaces created: ' + JSON.stringify(modulesAndInterfaces));
    console.log('Ignored prefixes: ' + JSON.stringify(ignoredPrefixes));
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
setTimeout(createMasterDefFile, 10000);