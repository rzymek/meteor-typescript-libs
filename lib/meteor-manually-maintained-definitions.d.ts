/**
 *
 *  Meteor definitions for TypeScript
 *  author - Olivier Refalo - orefalo@yahoo.com
 *  author - David Allen - dave@fullflavedave.com
 *
 *  Thanks to Sam Hatoum for the base code for auto-generating this file.
 *
 *  supports Meteor 1.0.2.1
 *
 */

/**
 * These are the modules and interfaces that can't be automatically generated from the Meteor data.js file
 */

interface EJSON extends JSON {}
interface TemplateStatic {
    new(): TemplateInstance;
    [templateName: string]: Meteor.TemplatePage;
}

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

    /** Start definitions for Template **/
    // DA: "Template" needs to support these functions:
        //         Template.<your template name>.rendered
        //         Template.<your template name>.created
        //         Template.<your template name>.destroyed
        //         Template.<your template name>.helpers
        //         Template.<your template name>.events
        //                       and
        //         Template.currentData
        //         Template.parentData, etc.

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
        (event?:Meteor.Event):any;
    }

    interface EventMap {
        [id:string]:Meteor.EventHandlerFunction;
    }

    interface TemplatePage {
        rendered: Function;
        created: Function;
        destroyed: Function;
        events(eventMap:Meteor.EventMap): void;
        helpers(helpers:{[id:string]: any}): void;
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

/**
 * These modules and interfaces are automatically generated from the Meteor api.js file
 */