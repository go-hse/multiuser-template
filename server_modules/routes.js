///////////////////////////////////////////////////////////////////////////////
// built-in module

'use strict';

var fs = require('fs');

GLOBAL.searchpaths(module);

// var logFuncs = require('log');
//var moduleName = "Routes]:";
// var errorLog = logFuncs.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
// var warningLog = logFuncs.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
// var infoLog = logFuncs.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
// var dbgLog = logFuncs.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);

var para = {};
para.title = 'Home';

// Links in key/value form
// key is the route; value is the title
var insideLinks = {
	'/': 'Home',
	'/logout': 'Logout',
	'/profile': 'Profile',
	'/fileupload': 'Upload Job',
};

var outsideLinks = {
	'/': 'Home',
	'/login': 'Login',
	'/signup': 'Sign Up'
};

para.links = outsideLinks;
para.message = "Test";


module.exports = function(app, passport) {

	// var userInterface = require('usermodel')(); // access the singleton 
	var fileInterface = require('filehandler')();

	app.use(function(req, res, next) {
		var sess = req.session;
		if (sess.views) {
			sess.views++;
		} else {
			sess.views = 1;
		}

		if (req.isAuthenticated()) {
			para.auth = "Authenticated";
		} else {
			para.auth = "Not Authenticated";
		}

		para.id = req.url; // used in layout.jade to determine the active menu
		para.views = sess.views;

		next(); // do not stop here
	});

	// normal routes ===============================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		if (req.isAuthenticated()) {
			para.links = insideLinks;
		} else {
			para.links = outsideLinks;
		}
		res.render('home', para);
	});


	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
		para.user = req.user;
		fileInterface.addUserDir(req.user.email);
		res.render('profile', para);
	});

	// PROFILE SECTION =========================
	app.get('/jobs', isLoggedIn, function(req, res) {
		para.user = req.user;
		fileInterface.addUserDir(req.user.email);
		res.render('profile', para);
	});


	// Test on command-line
	// curl -F "image=@/home/adr/Tmp/link.txt" localhost:8080/fileupload
	app.route('/fileupload')
		.get(isLoggedIn, function(req, res) {
			para.title = 'File';
			res.render('fileupload', para);
		})
		.post(isLoggedIn, function(req, res) {
			var fstream;
			req.pipe(req.busboy);
			req.busboy.on('file', function(fieldname, file, filename) {
				if (req && req.user && req.user.email) {
					var filepath = fileInterface.addFile(req.user.email, filename);
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


	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		para.links = outsideLinks;
		req.logout();
		res.redirect('/');
	});

	// =============================================================================
	// AUTHENTICATE (FIRST LOGIN) ==================================================
	// =============================================================================
	// locally --------------------------------
	// LOGIN ===============================
	// show the login form
	app.get('/login', function(req, res) {
		para.message = req.flash('error')[0];
		// infoLog(JSON.stringify(fls, null, ' '));
		res.render('login', para);
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile', // redirect to the secure profile section
		failureRedirect: '/login', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

	// SIGNUP =================================
	// show the signup form
	app.get('/signup', function(req, res) {
		para.message = req.flash('error')[0];
		res.render('signup', para);
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile', // redirect to the secure profile section
		failureRedirect: '/signup', // redirect back to the signup page if there is an error
		failureFlash: true // allow flash messages
	}));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		para.links = insideLinks;
		return next();
	}
	para.links = outsideLinks;
	para.user = null;
	res.redirect('/');
}