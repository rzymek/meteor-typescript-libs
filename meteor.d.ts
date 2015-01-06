/**
 *
 *  Meteor definitions for TypeScript
 *  author - Olivier Refalo - orefalo@yahoo.com
 *  author - David Allen - dave@fullflavedave.com
 *
 *  Thanks to Sam Hatoum for the base code for auto-generating this file.
 *
 *  supports Meteor 0.9.1.1
 *
 */

/**
 * These are the modules and interfaces that can't be automatically generated from the Meteor api.js file
 */
//declare var Template: Meteor.TemplateBase;

interface EJSON extends JSON {}
interface MongoSelector extends Object {}
interface MongoModifier {}
interface MongoSortSpecifier {}
interface MongoFieldSpecifier extends Object {}
declare module Match {
    var Any;
    var String;
    var Integer;
    var Boolean;
    var undefined;
    //function null();  // not allowed in TypeScript
    var Object;
    function Optional(pattern):boolean;
    function ObjectIncluding(dico):boolean;
    function OneOf(...patterns);
    function Where(condition);
}

declare module Meteor {
    //interface EJSONObject extends Object {}

    interface LoginWithExternalServiceOptions {
        requestPermissions?: string[];
        requestOfflineToken?: Boolean;
        forceApprovalPrompt?: Boolean;
        userEmail?: string;
    }

    function loginWithMeteorDeveloperAccount(options?: Meteor.LoginWithExternalServiceOptions, callback?: Function): void;
    function loginWithFacebook(options?: Meteor.LoginWithExternalServiceOptions, callback?: Function): void;
    function loginWithGithub(options?: Meteor.LoginWithExternalServiceOptions, callback?: Function): void;
    function loginWithGoogle(options?: Meteor.LoginWithExternalServiceOptions, callback?: Function): void;
    function loginWithMeetup(options?: Meteor.LoginWithExternalServiceOptions, callback?: Function): void;
    function loginWithTwitter(options?: Meteor.LoginWithExternalServiceOptions, callback?: Function): void;
    function loginWithWeibo(options?: Meteor.LoginWithExternalServiceOptions, callback?: Function): void;

    interface UserEmail {
        address:string;
        verified:boolean;
    }

    interface User {
        _id?:string;
        username?:string;
        emails?:Meteor.UserEmail[];
        createdAt?: number;
        profile?: any;
        services?: any;
    }

    interface SubscriptionHandle {
        stop(): void;
        ready(): boolean;
    }

    interface TemplateBase {
        [templateName: string]: Meteor.Template;
    }

    interface Template {
        rendered: Function;
        created: Function;
        destroyed: Function;
        events(eventMap:{[id:string]: Function}): void;
        helpers(helpers:{[id:string]: any}): void;
    }

    interface RenderedTemplate extends Object {}

    interface DataContext extends Object {}

    interface Tinytest {
        add(name:string, func:Function);
        addAsync(name:string, func:Function);
    }

    enum StatusEnum {
        connected,
        connecting,
        failed,
        waiting,
        offline
    }

    interface LiveQueryHandle {
        stop(): void;
    }

    interface EmailFields {
        subject?: Function;
        text?: Function;
    }

    interface EmailTemplates {
        from: string;
        siteName: string;
        resetPassword: Meteor.EmailFields;
        enrollAccount:  Meteor.EmailFields;
        verifyEmail:  Meteor.EmailFields;
    }

    interface AccountsBase {
        EmailTemplates: {
            from: string;
            siteName: string;
            resetPassword:  Meteor.EmailFields;
            enrollAccount:  Meteor.EmailFields;
            verifyEmail:  Meteor.EmailFields;
        }
        loginServicesConfigured(): boolean;
    }

    interface AllowDenyOptions {
        insert?: (userId:string, doc) => boolean;
        update?: (userId, doc, fieldNames, modifier) => boolean;
        remove?: (userId, doc) => boolean;
        fetch?: string[];
        transform?: Function;
    }

    interface Error {
        error: number;
        reason?: string;
        details?: string;
    }
}

declare module Mongo {
    interface CollectionFieldSpecifier {
        [id: string]: Number;
    }

    enum CollectionIdGenerationEnum {
        STRING,
        MONGO
    }

//    interface CollectionOptions {
//        connection: Object;
//        idGeneration: Mongo.CollectionIdGenerationEnum;
//        transform?: (document)=>any;
//    }
//
//    function Collection<T>(name:string, options?: Mongo.CollectionOptions) : void;
}

declare module Tracker {
    function Computation(): void;
    interface Computation {

    }
    function Dependency(): void;
    interface Dependency {
        changed(): void;
        depend(fromComputation: Tracker.Computation): boolean;
        hasDependents(): boolean;
    }
}

//declare module Package {
//    function describe(metadata:PackageDescribeAPI);
//    function on_use(func:{(api:Api, where?:string[]):void});
//    function on_use(func:{(api:Api, where?:string):void});
//    function on_test(func:{(api:Api):void}) ;
//    function register_extension(extension:string, options:PackageRegisterExtensionOptions);
//    interface PackageRegisterExtensionOptions {(bundle:Bundle, source_path:string, serve_path:string, where?:string[]):void}
//    interface PackageDescribeAPI {
//        summary: string;
//    }
//    interface Api {
//        export(variable:string);
//        export(variables:string[]);
//        use(deps:string, where?:string[]);
//        use(deps:string, where?:string);
//        use(deps:string[], where?:string[]);
//        use(deps:string[], where?:string);
//        add_files(file:string, where?:string[]);
//        add_files(file:string, where?:string);
//        add_files(file:string[], where?:string[]);
//        add_files(file:string[], where?:string);
//        imply(package:string);
//        imply(packages:string[]);
//    }
//    interface BundleOptions {
//        type: string;
//        path: string;
//        data: any;
//        where: string[];
//    }
//    interface Bundle {
//        add_resource(options:BundleOptions);
//        error(diagnostics:string);
//    }
//}

declare module Npm {
    function require(module:string);
    function depends(dependencies:{[id:string]:string});
}

declare module HTTP {
    enum HTTPMethodEnum {
        GET,
        POST,
        PUT,
        DELETE
    }

    interface HTTPRequest {
        content?:string;
        data?:any;
        query?:string;
        params?:{[id:string]:string};
        auth?:string;
        headers?:{[id:string]:string};
        timeout?:number;
        followRedirects?:boolean;
    }

    interface HTTPResponse {
        statusCode:number;
        content:string;
        // response is not always json
        data:any;
        headers:{[id:string]:string};
    }
}

declare module Email {
    interface EmailMessage {
        from: string;
        to: any;  // string or string[]
        cc?: any; // string or string[]
        bcc?: any; // string or string[]
        replyTo?: any; // string or string[]
        subject: string;
        text?: string;
        html?: string;
        headers?: {[id: string]: string};
    }
}

declare module DDP {
    interface DDPStatic {
        subscribe(name, ...rest);
        call(method:string, ...parameters):void;
        apply(method:string, ...parameters):void;
        methods(IMeteorMethodsDictionary);
        status():DDPStatus;
        reconnect();
        disconnect();
        onReconnect();
    }

    interface DDPStatus {
        connected: boolean;
        status: Meteor.StatusEnum;
        retryCount: number;
        //To turn this into an interval until the next reconnection, use retryTime - (new Date()).getTime()
        retryTime?: number;
        reason?: string;
    }
}

declare module Random {
    function fraction():number;
    function hexString(numberOfDigits:number):string; // @param numberOfDigits, @returns a random hex string of the given length
    function choice(array:any[]):string; // @param array, @return a random element in array
    function choice(str:string):string; // @param str, @return a random char in str
}

declare module Blaze {
    interface View {
        name: string;
        parentView: Blaze.View;
        isCreated: boolean;
        isRendered: boolean;
        isDestroyed: boolean;
        renderCount: number;
        autorun(runFunc: Function): void;
        onViewCreated(func: Function): void;
        onViewReady(func: Function): void;
        onViewDestroyed(func: Function): void;
        firstNode(): Node;
        lastNode(): Node;
        template: Blaze.Template;
        templateInstance(): any;
    }
    interface Template {
        viewName: string;
        renderFunction: Function;
        constructView(): Blaze.View;
    }
}

declare function ReactiveVar(initialValue: any, equalsFunc?: (oldVal:any, newVal:any)=>boolean): void;

/**
 * These modules and interfaces are automatically generated from the Meteor api.js file
 */
declare module Accounts {
	var ui: {
		config(options: {
				requestPermissions?: Object;
				requestOfflineToken?: Object;
				forceApprovalPrompt?: Object;
				passwordSignupFields?: string;
			}): void;
	};
	var emailTemplates: Meteor.EmailTemplates;
	function config(options: {
				sendVerificationEmail?: Boolean;
				forbidClientAccountCreation?: Boolean;
				restrictCreationByEmailDomain?: string;
				loginExpirationInDays?: number;
				oauthSecretKey?: string;
			}): void;
	function validateLoginAttempt(func: Function): {stop: Function};
	function onLogin(func: Function): {stop: Function};
	function onLoginFailure(func: Function): {stop: Function};
	function onCreateUser(func: Function): void;
	function validateNewUser(func: Function): void;
	function onResetPasswordLink(callback: Function): void;
	function onEmailVerificationLink(callback: Function): void;
	function onEnrollmentLink(callback: Function): void;
	function createUser(options: {
				username?: string;
				email?: string;
				password?: string;
				profile?: Object;
			}, callback?: Function): string;
	function changePassword(oldPassword: string, newPassword: string, callback?: Function): void;
	function forgotPassword(options: {
				email?: string;
			}, callback?: Function): void;
	function resetPassword(token: string, newPassword: string, callback?: Function): void;
	function verifyEmail(token: string, callback?: Function): void;
	function setPassword(userId: string, newPassword: string): void;
	function sendResetPasswordEmail(userId: string, email?: string): void;
	function sendEnrollmentEmail(userId: string, email?: string): void;
	function sendVerificationEmail(userId: string, email?: string): void;
}

declare module Blaze {
	var currentView: Blaze.View;
	function With(data: any, contentFunc: Function): Blaze.View;
	function If(conditionFunc: Function, contentFunc: Function, elseFunc?: Function): Blaze.View;
	function Unless(conditionFunc: Function, contentFunc: Function, elseFunc?: Function): Blaze.View;
	function Each(argFunc: Function, contentFunc: Function, elseFunc?: Function): Blaze.View;
	function isTemplate(value: any): boolean;
	function render(templateOrView: any, parentNode: Node, nextNode?: Node, parentView?: Blaze.View): Blaze.View;
	function renderWithData(templateOrView: any, data: any, parentNode: Node, nextNode?: Node, parentView?: Blaze.View): Blaze.View;
	function remove(renderedView: Blaze.View): void;
	function toHTML(templateOrView: any): string;
	function toHTMLWithData(templateOrView: any, data: any): string;
	function getData(elementOrView?: any): Object;
	function getView(element?: HTMLElement): Blaze.View;
	function Template(viewName?: string, renderFunction?: Function): void;
	function TemplateInstance(view: Blaze.View): void;
	interface TemplateInstance {
			data(): Object;
		view(): Object;
		firstNode(): Object;
		lastNode(): Object;
		$(selector: string): Node[];
		findAll(selector: string): HTMLElement[];
		find(selector?: string): HTMLElement;
		autorun(runFunc: Function): Object;
	}

	function View(name?: string, renderFunction?: Function): void;
}

declare module Match {
	function test(value: any, pattern: any): boolean;
}

declare module DDP {
	function connect(url: string): DDP.DDPStatic;
}

declare module EJSON {
	var newBinary: any;
	function addType(name: string, factory: Function): void;
	function toJSONValue(val: EJSON): JSON;
	function fromJSONValue(val: JSON): any;
	function stringify(val: EJSON, options?: {
				indent?: Boolean;
				canonical?: Boolean;
			}): string;
	function parse(str: string): EJSON;
	function isBinary(x: Object): boolean;
	function equals(a: EJSON, b: EJSON, options?: {
				keyOrderSensitive?: Boolean;
			}): boolean;
	function clone<T>(val:T): T; /** TODO: add return value **/
	function CustomType(): void;
	interface CustomType {
			typeName(): string;
		toJSONValue(): JSON;
		clone(): EJSON.CustomType;
		equals(other: Object): boolean;
	}

}

declare module Meteor {
	var users: Mongo.Collection<User>;
	var isClient: boolean;
	var isServer: boolean;
	var settings: {[id:string]: any};
	var isCordova: boolean;
	var release: string;
	function userId(): string;
	function loggingIn(): boolean;
	function user(): Meteor.User;
	function logout(callback?: Function): void;
	function logoutOtherClients(callback?: Function): void;
	function loginWith<ExternalService>(options?: {
				requestPermissions?: string[];
				requestOfflineToken?: Boolean;
				forceApprovalPrompt?: Boolean;
				userEmail?: string;
				loginStyle?: string;
			}, callback?: Function): void;
	function loginWithPassword(user: any, password: string, callback?: Function): void;
	function subscribe(name: string, ...args): SubscriptionHandle;
	function call(name: string, ...args): void;
	function apply(name: string, args: EJSON[], options?: {
				wait?: Boolean;
				onResultReceived?: Function;
			}, asyncCallback?: Function): void;
	function status(): Meteor.StatusEnum;
	function reconnect(): void;
	function disconnect(): void;
	function onConnection(callback: Function): void;
	function publish(name: string, func: Function): void;
	function methods(methods: Object): void;
	function wrapAsync(func: Function, context?: Object): any;
	function startup(func: Function): void;
	function setTimeout(func: Function, delay: number): number;
	function setInterval(func: Function, delay: number): number;
	function clearInterval(id: number): void;
	function clearTimeout(id: number): void;
	function absoluteUrl(path?: string, options?: {
				secure?: Boolean;
				replaceLocalhost?: Boolean;
				rootUrl?: string;
			}): string;
	function Error(error: string, reason?: string, details?: string): void;
}

declare module Mongo {
	function Collection<T>(name: string, options?: {
				connection?: Object;
				idGeneration?: Mongo.CollectionIdGenerationEnum;
				transform?: (document)=>any;
			}): void;
	interface Collection<T> {
			insert(doc: Object, callback?: Function): string;
		update(selector: MongoSelector, modifier: MongoModifier, options?: {
				multi?: Boolean;
				upsert?: Boolean;
			}, callback?: Function): number;
		find(selector?: MongoSelector, options?: {
				sort?: MongoSortSpecifier;
				skip?: number;
				limit?: number;
				fields?: MongoFieldSpecifier;
				reactive?: Boolean;
				transform?: (document)=>any;
			}): Mongo.Cursor<T>;
		findOne(selector?: MongoSelector, options?: {
				sort?: MongoSortSpecifier;
				skip?: number;
				fields?: MongoFieldSpecifier;
				reactive?: Boolean;
				transform?: (document)=>any;
			}): EJSON;
		remove(selector: MongoSelector, callback?: Function): void;
		upsert(selector: MongoSelector, modifier: MongoModifier, options?: {
				multi?: Boolean;
			}, callback?: Function): {numberAffected?: number; insertedId?: string;};
		allow(options: {
				insert?: Function;
				 update?: Function;
				 remove?: Function;
				fetch?: string[];
				transform?: (document)=>any;
			}): boolean;
		deny(options: {
				insert?: Function;
				 update?: Function;
				 remove?: Function;
				fetch?: string[];
				transform?: (document)=>any;
			}): boolean;
	}

	function ObjectID(hexString: string): void;
	function Cursor<T>(): void;
	interface Cursor<T> {
			forEach(callback: Function, thisArg?: any): void;
		map(callback: Function, thisArg?: any): void;
		fetch(): Array<T>;
		count(): number;
		observe(callbacks: Object): Meteor.LiveQueryHandle;
		observeChanges(callbacks: Object): Meteor.LiveQueryHandle;
	}

}

declare module Tracker {
	var active: boolean;
	var currentComputation: Tracker.Computation;
	function Computation(): void;
	interface Computation {
			stopped(): boolean;
		invalidated(): boolean;
		firstRun(): boolean;
		onInvalidate(callback: Function): void;
		invalidate(): void;
		stop(): void;
	}

	function flush(): void;
	function autorun(runFunc: Function): Tracker.Computation;
	function nonreactive(func: Function): void;
	function onInvalidate(callback: Function): void;
	function afterFlush(callback: Function): void;
	function Dependency(): void;
	interface Dependency {
			depend(fromComputation?: Tracker.Computation): boolean;
		changed(): void;
		hasDependents(): boolean;
	}

}

declare module Assets {
	function getText(assetPath: string, asyncCallback?: Function): string;
	function getBinary(assetPath: string, asyncCallback?: Function): EJSON;
}

declare module App {
	function info(options: {
				id?: string;
				 version?: string;
				 name?: string;
				 description?: string;
				 author?: string;
				 email?: string;
				 website?: string;
			}): void;
	function setPreference(name: string, value: string): void;
	function configurePlugin(pluginName: string, config: Object): void;
	function icons(icons: Object): void;
	function launchScreens(launchScreens: Object): void;
}

declare module Package {
	function describe(options: {
				summary?: string;
				version?: string;
				name?: string;
				git?: string;
			}): void;
	function onUse(func: Function): void;
	function onTest(func: Function): void;
	function registerBuildPlugin(options?: {
				name?: string;
				use?: string;
				sources?: string[];
				npmDependencies?: Object;
			}): void;
}

declare module Npm {
	function depends(dependencies: Object): void;
	function require(name: string): void;
}

declare module Cordova {
	function depends(dependencies: Object): void;
}

declare module Template {
	var created: Function;
	var rendered: Function;
	var destroyed: Function;
	var body: Meteor.TemplateBase;
	function helpers(helpers:{[id:string]: any}): void;
	function events(eventMap: {[actions: string]: Function}): void;
	function instance(): Blaze.TemplateInstance;
	function currentData(): {};
	function parentData(numLevels?: number): {};
	function registerHelper(name: string, func: Function): void;
}

declare module Session {
	function set(key: string, value: any): void;
	function setDefault(key: string, value: any): void;
	function get(key: string): any;
	function equals(key: string, value: any): boolean;
}

declare module HTTP {
	function call(method: string, url: string, options?: {
				content?: string;
				data?: Object;
				query?: string;
				params?: Object;
				auth?: string;
				headers?: Object;
				timeout?: number;
				followRedirects?: Boolean;
			}, asyncCallback?: Function): HTTP.HTTPResponse;
	function get(url: string, callOptions?: Object, asyncCallback?: Function): HTTP.HTTPResponse;
	function post(url: string, callOptions?: Object, asyncCallback?: Function): HTTP.HTTPResponse;
	function put(url: string, callOptions?: Object, asyncCallback?: Function): HTTP.HTTPResponse;
	function del(url: string, callOptions?: Object, asyncCallback?: Function): HTTP.HTTPResponse;
}

declare module Email {
	function send(options: {
				from?: string;
				to?: string;
				 cc?: string;
				 bcc?: string;
				 replyTo?: string;
				subject?: string;
				text?: string;
				 html?: string;
				headers?: Object;
			}): void;
}

declare module ReactiveVar {
	function get(); /** TODO: add return value **/
	function set(newValue: any); /** TODO: add return value **/
}

