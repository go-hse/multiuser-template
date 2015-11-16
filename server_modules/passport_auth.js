// https://github.com/scotch-io/easy-node-authentication/blob/master/config/passport.js
// load all the things we need

'use strict';
GLOBAL.searchpaths(module);

var logFuncs = require('log');
logFuncs.setErrorLevel(4); // all Output
var moduleName = "Passport]:";
//var errorLog = logFuncs.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
var warningLog = logFuncs.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
var infoLog = logFuncs.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
//var dbgLog = logFuncs.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);


var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var userInterface = require('usermodel')('mongodb://localhost:27017/jobkiosk');
var userModel = userInterface.userModel;


module.exports = function(passport) {

	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		userModel.findById(id, function(err, user) {
			done(err, user);
		});
	});

	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	passport.use('local-login', new LocalStrategy({
			// by default, local strategy uses username and password, we will override with email
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		},
		function(req, email, password, done) {
			if (email) {
				email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
			}
			infoLog('Login ' + email);
			// asynchronous
			process.nextTick(function() {
				userModel.findOne({
					'email': email
				}, function(err, user) {
					// if there are any errors, return the error
					if (err) {
						return done(err);
					}
					// if no user is found, return the message
					if (!user) {
						infoLog('No user ' + email);
						return done(null, false, {message: 'No user found.'});
					}
					if (!user.validPassword(password)) {
						infoLog('Wrong password ' + email);
						return done(null, false, {message: 'Oops! Wrong password.'});
					}

					// all is well, return user
					else {
						return done(null, user);
					}
				});
			});

		}));

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	passport.use('local-signup', new LocalStrategy({
			// by default, local strategy uses username and password, we will override with email
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		},
		function(req, email, password, done) {
			if (email) {
				email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
			}

			userModel.findOne({
				'email': email
			}, function(err, user) {
				// if there are any errors, return the error
				if (err) {
					return done(err);
				}

				// check to see if theres already a user with that email
				if (user) {
					infoLog('That email is already taken: ' + email);
					return done(null, false, {message: 'That email is already taken.'});
				} else {

					// create the user
					var newUser = new userModel();

					newUser.email = email;
					newUser.password = newUser.generateHash(password);

					newUser.save(function(err) {
						if (err) {
							return done(err);
						}

						return done(null, newUser);
					});
				}

			});
		}));
};