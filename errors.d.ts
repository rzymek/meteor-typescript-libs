//
// errors smart package
//
// https://github.com/tmeasday/meteor-errors
//
//

declare module Meteor {

	var Errors:{
		throw(message:string): void;
		clear(): void;
	}

}