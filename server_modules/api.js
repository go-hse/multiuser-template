///////////////////////////////////////////////////////////////////////////////
// built-in module

'use strict';

var fs = require('fs');

GLOBAL.searchpaths(module);

var logFuncs = require('log');
var moduleName = "Routes]:";
// var errorLog = logFuncs.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
//var warningLog = logFuncs.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
// var infoLog = logFuncs.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
var dbgLog = logFuncs.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);


module.exports = function(app) {

	var userInterface = require('usermodel')(); // access the singleton 
	var fileInterface = require('filehandler')();
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

	// Test on command-line
	// curl -F "image=@/home/adr/Tmp/link.txt" localhost:8080/fileupload
	app.post('/api/job', isLoggedIn, function(req, res) {
		var fstream;

		var job = {};

		req.pipe(req.busboy);

		// assemble the fields
		req.busboy.on('field', function(key, value) {
			dbgLog("Adding job", key, value);
			job[key] = value;
		});

		// save the job
		req.busboy.on('finish', function() {
			dbgLog("Adding job done");
			if (req && req.user && req.user._id) {
				userInterface.addJob(req.user, job);
			}
		});

		req.busboy.on('file', function(fieldname, file, filename) {
			dbgLog("Adding job", fieldname, filename);
			if (req && req.user && req.user.email && filename) {
				var filepath = fileInterface.addFile(req.user.email, filename);
				job.fullimage = fileInterface.PDF2PNGname(filepath, 300);;
				fstream = fs.createWriteStream(filepath);
				file.pipe(fstream);
				fstream.on('close', function() {
					fileInterface.PDF2PNG(filepath, 300);
					fileInterface.PDF2PNG(filepath, 72);
					res.redirect('back');
				});
			} else {
				res.redirect('back');
			}
		});
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