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
var userInterface = require('usermodel')('mongodb://localhost:27017/users');

describe("Testing User DB: ", function() {

	beforeEach(function() {
		userInterface.clearDB();
	});

	describe("Testing add one DB entry", function() {
		var result = {};

		beforeEach(function(done) {
			userInterface.addUser("test@test.de", "gF34sdf#56", function(obj) {
				result = obj;
				done();
			});
		});

		it("DB has new entry", function(done) {
			expect(result.error).toBe(false);
			done();
		});

	});


	describe("Testing add two identical DB entries", function() {
		var result = {};

		beforeEach(function(done) {
			userInterface.addUser("test@test.de", "gF34sdf#56", function(obj) {
				userInterface.addUser("test@test.de", "gF34sdf#56", function(obj) {
					result = obj;
					done();
				});
			});
		});

		it("DB cannot have the same email twice", function(done) {
			expect(result.error).toBe(true);
			done();
		});
	});


	describe("Testing add two different DB entries", function() {
		var result = {};

		beforeEach(function(done) {
			userInterface.addUser("test@test.de", "gF34sdf#56", function(obj) {
				userInterface.addUser("test2@test.de", "gF34sdf#56", function(obj) {
					result = obj;
					done();
				});
			});
		});

		it("DB cannot have the same email twice", function(done) {
			expect(result.error).toBe(false);
			done();
		});

		it("DB can login with correct password", function(done) {
			expect(result.error).toBe(false);
			done();
		});

	});


	describe("Testing login:", function() {
		var result = {};

		beforeEach(function(done) {
			userInterface.addUser("test@test.de", "gF34sdf#56", function(o) {
				userInterface.login("test@test.de", "gF34sdf#56", function(obj) {
					console.log('Correct login', obj.message, obj.error);
					result = obj;
					done();
				});
			});
		});

		it("User can login with correct password", function(done) {
			expect(result.error).toBe(false);
			done();
		});

	});


	describe("Testing login:", function() {
		var result = {};

		beforeEach(function(done) {
			userInterface.addUser("test@test.de", "gF34sdf#56", function(o) {
				userInterface.login("test@test.de", "gF34sdf_56", function(obj) {
					result = obj;
					done();
				});
			});
		});

		it("User cannot login with false password", function(done) {
			expect(result.error).toBe(true);
			done();
		});

	});




	afterEach(function() {

	});


});