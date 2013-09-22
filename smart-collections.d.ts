// https://github.com/arunoda/meteor-smart-collections
//
// mrt add smart-collections
// now use Posts = new Meteor.SmartCollection('posts');
//
// authored by orefalo

/// <reference path="meteor.d.ts"/>

declare module Meteor {

	function SmartCollection<T>(name:string, options?:Meteor.CollectionOptions);

	interface SmartCollection<T> extends Meteor.Collection<T> {

		new(name:string, options?:Meteor.CollectionOptions):T;

		// keys can only be strings at this time - per author
		ObjectID(hexString?:string);

	}
}