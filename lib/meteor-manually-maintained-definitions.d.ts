/**
 *
 *  Meteor definitions for TypeScript
 *  author - Olivier Refalo - orefalo@yahoo.com
 *  author - David Allen - dave@fullflavedave.com
 *
 *  Thanks to Sam Hatoum for the base code for auto-generating this file.
 *
 *  supports Meteor 1.0.3.2
 *
 */

/**
 * These are the modules and interfaces that can't be automatically generated from the Meteor data.js file
 */

interface EJSONable {
    [key: string]: number | string | boolean | Object | number[] | string[] | Object[] | Date | Uint8Array | EJSON.CustomType;
}
interface JSONable {
    [key: string]: number | string | boolean | Object | number[] | string[] | Object[];
}
interface EJSON extends EJSONable {}

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
    /** Start definitions for Template **/
    interface Event {
        type:string;
        target:HTMLElement;
        currentTarget:HTMLElement;
        which: number;
        stopPropagation():void;
        stopImmediatePropagation():void;
        preventDefault():void;
        isPropagationStopped():boolean;
        isImmediatePropagationStopped():boolean;
        isDefaultPrevented():boolean;
    }

    interface EventHandlerFunction extends Function {
        (event?:Meteor.Event):void;
    }

    interface EventMap {
        [id:string]:Meteor.EventHandlerFunction;
    }
    /** End definitions for Template **/

    interface LoginWithExternalServiceOptions {
        requestPermissions?: string[];
        requestOfflineToken?: Boolean;
        forceApprovalPrompt?: Boolean;
        userEmail?: string;
        loginStyle?: string;
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

    interface Error {
        error: number;
        reason?: string;
        details?: string;
    }

    interface Connection {
        id: string;
        close: Function;
        onClose: Function;
        clientAddress: string;
        httpHeaders: Object;
    }
}

declare module Mongo {
    interface Selector extends Object {}
    interface Modifier {}
    interface SortSpecifier {}
    interface FieldSpecifier {
        [id: string]: Number;
    }
    enum IdGenerationEnum {
        STRING,
        MONGO
    }
    interface AllowDenyOptions {
        insert?: (userId:string, doc) => boolean;
        update?: (userId, doc, fieldNames, modifier) => boolean;
        remove?: (userId, doc) => boolean;
        fetch?: string[];
        transform?: Function;
    }
}

declare module HTTP {

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
		statusCode?:number;
		headers?:{[id:string]: string};
		content?:string;
		data?:any;
	}

    function call(method: string, url: string, options?: HTTP.HTTPRequest, asyncCallback?:Function):HTTP.HTTPResponse;
    function del(url: string, callOptions?: HTTP.HTTPRequest, asyncCallback?: Function): HTTP.HTTPResponse;
    function get(url: string, callOptions?: HTTP.HTTPRequest, asyncCallback?: Function): HTTP.HTTPResponse;
    function post(url: string, callOptions?: HTTP.HTTPRequest, asyncCallback?: Function): HTTP.HTTPResponse;
    function put(url: string, callOptions?: HTTP.HTTPRequest, asyncCallback?: Function): HTTP.HTTPResponse;

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
    function id(numberOfChars?: number): string;
    function secret(numberOfChars?: number): string;
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

declare module BrowserPolicy {

    interface framing {
        disallow():void;
        restrictToOrigin(origin:string):void;
        allowAll():void;
    }
    interface content {
        allowEval():void;
        allowInlineStyles():void;
        allowInlineScripts():void;
        allowSameOriginForAll():void;
        allowDataUrlForAll():void;
        allowOriginForAll(origin:string):void;
        allowImageOrigin(origin:string):void;
        allowFrameOrigin(origin:string):void;
        allowContentTypeSniffing():void;
        allowAllContentOrigin():void;
        allowAllContentDataUrl():void;
        allowAllContentSameOrigin():void;

        disallowAll():void;
        disallowInlineStyles():void;
        disallowEval():void;
        disallowInlineScripts():void;
        disallowFont():void;
        disallowObject():void;
        disallowAllContent():void;
        //TODO: add the basic content types
        // allow<content type>Origin(origin)
        // allow<content type>DataUrl()
        // allow<content type>SameOrigin()
        // disallow<content type>()
    }
}

declare module Tracker {
    export var ComputationFunction: (computation: Tracker.Computation) => void;

}

declare var IterationCallback: <T>(doc: T, index: number, cursor: Mongo.Cursor<T>) => void;

/**
 * These modules and interfaces are automatically generated from the Meteor api.js file
 */