// Definitions for the iron-router smart package
//
// https://atmosphere.meteor.com/package/iron-router
// https://github.com/EventedMind/iron-router

 declare module Router {

	interface TemplateConfig {
		to?: string;
		waitOn?: boolean;
		data?: boolean;
	}

	interface TemplateConfigDico {[id:string]:TemplateConfig}

	interface Configuration {
		layout?: string;
		notFoundTemplate?: string;
		loadingTemplate?: string;
		renderTemplates?:TemplateConfigDico;

		before?:Function;
		after?:Function;
	}

//	interface RouteHandler {
//		route(name:string, routeParams?:MapConfig);
//		params:any[];
//	}

	interface MapConfig {
		path?:string;
		// by default template is the route name, this field is the override
		template?:string;

		// can be a Function or an object literal {}
		data?: any;
		// waitOn can be a subscription handle, an array of subscription handles or a function that returns a subscription handle
		// or array of subscription handles. A subscription handle is what gets returned when you call Meteor.subscribe
		waitOn?: any;
		loadingTemplate?:string;
		notFoundTemplate?: string;
		controller?: string;
		action?: string;
	}

	// These are for Router
	function page():void;

	function add(route:Object):void;

	function to(path:string, ...args:any[]):void;

	function filters(filtersMap:Object);

	function filter(filterName:string, options?:Object);

	// These are for Iron-Router

	function configure(config:Configuration);

	function map(func:Function):void;

	function route(name:string, routeParams?:MapConfig, handler?:any);

	function path(route:string, params?:Object):string;

	function url(route:string):string;

	function go(route:string):void;

//	routes: Object;
//
//	params: any[];

}

interface RouteController {

	render(route:string);
	extend(definition:{});
}

declare var RouteController:RouteController;
