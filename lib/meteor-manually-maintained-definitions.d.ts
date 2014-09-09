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
declare module Meteor {
    interface EJSONObject extends Object {}

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

    interface MatchBase {
        Any;
        String;
        Integer;
        Boolean;
        undefined;
        null;
        Object;
        Optional(pattern):boolean;
        ObjectIncluding(dico):boolean;
        OneOf(...patterns);
        Where(condition);
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