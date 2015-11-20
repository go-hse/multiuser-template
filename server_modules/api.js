///////////////////////////////////////////////////////////////////////////////
// built-in module

'use strict';

// var fs = require('fs');

GLOBAL.searchpaths(module);

//var logFuncs = require('log');
//var moduleName = "Routes]:";
// var errorLog = logFuncs.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
//var warningLog = logFuncs.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
// var infoLog = logFuncs.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
// var dbgLog = logFuncs.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);


module.exports = function(app) {

	var userInterface = require('usermodel')(); // access the singleton 
	// var fileInterface = require('filehandler')();
	// var jobsInterface = require('jobsmodel')();


	app.get('/api/profile', isLoggedIn, function(req, res) {
		if (req && req.user && req.user._id) {
			userInterface.findById(req.user._id, function(err, user) {
				if (err) {
					res.json({
						message: 'user not found!'
					});
				} else {
					user.password = undefined;
					res.json(user);
				}
			});
		} else {
			res.json({
				message: 'user not found!'
			});
		}
	});

	app.post('/api/profile', isLoggedIn, function(req, res) {
		if (req && req.user && req.user._id) {
			userInterface.updateUser(req.user._id, req.body, function(response) {
				res.json(response);
			});
		} else {
			res.json({
				message: 'user not found!'
			});
		}
	});



	app.get('/api', isLoggedIn, function(req, res) {
		res.json({
			message: 'hooray! welcome to our api!'
		});
	});
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.json({
		message: 'sorry, you are not logged in!'
	});
}