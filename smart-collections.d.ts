// https://github.com/arunoda/meteor-smart-collections
//
// mrt add smart-collections
// now use Posts = new Meteor.SmartCollection('posts');
//
// authored by orefalo

/// <reference path="meteor.d.ts"/>

declare module Meteor {

	interface SmartCollection<T> {

		new(name:string, options?:Meteor.CollectionOptions):T;

		// keys can only be strings at this time - per author
		ObjectID(hexString?:string);

		find(selector?:any, options?):Meteor.Cursor<T>;

		findOne(selector?, options?):T;

		insert(doc:T, callback?:Function):string;

		update(selector:any, modifier, options?, callback?:Function);

		remove(selector:any, callback?:Function);

		allow(options:Meteor.AllowDenyOptions);

		deny(options);
	}
}