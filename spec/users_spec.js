/* global describe, expect */

'use strict';

var path = require('path');

GLOBAL.searchpaths = (function(mod) {
	var searchdirs = [
		path.resolve(__dirname, "../server_modules"),
	];
	// module is not global!
	return function(mod) {
		for (var idx = 0; idx < searchdirs.length; ++idx) {
			mod.paths.push(searchdirs[idx]);
		}
	};
}());

GLOBAL.searchpaths(module);

// this is the library to be tested
// has a different URL; uses mongoose.connection
var userInterface = require('usermodel.js')('mongodb://localhost:27017/users');

describe("Testing User DB", function() {

	beforeEach(function() {
		userInterface.clearDB();
	});

	describe("Testing add DB entries", function() {
		var result = {};

		beforeEach(function(done) {
			userInterface.addUser({
				email: "test@test.de",
				password: "gF34sdf#56"
			}, function(obj) {
				result = obj;
				done();
			});
		});

		it("DB has new entry", function() {
			expect(result.error).toBe(false);
		});

	});

	afterEach(function() {

	});


});