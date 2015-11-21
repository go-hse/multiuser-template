// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');


GLOBAL.searchpaths(module);
var log = require('log');

var moduleName = "users]:";
var errorLog = log.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
// var warningLog = log.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
// var infoLog = log.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
var dbgLog = log.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);

log.getErrorLevel();

function Users() {
	"use strict";
	var that = {};
	var userModel = null;

	var mongooseDB = require('db_connection')();
	var jobsInterface = require('jobsmodel')();

	// var mongooseDB = mongoose.createConnection(url);

	var fields = ['familyname', 'givenname', 'email', 'company', 'department', 'street', 'postcode', 'city', 'countrytxt', 'password', 'resetPasswordToken', 'resetPasswordExpires'];
	var schema = {};
	for (var i = 0; i < fields.length; ++i) {
		schema[fields[i]] = {
			type: String,
			required: false,
			unique: false
		};
	}
	schema.email.unique = true;
	schema.email.required = true;
	schema.password.required = true;

	schema.department.required = false;
	schema.resetPasswordToken.required = false;
	schema.resetPasswordExpires.type = 'Date';
	schema.resetPasswordExpires.required = false;
	schema.jobs = [{
		_id: String
	}];

	var userSchema = new mongoose.Schema(schema);

	// generating a hash
	userSchema.methods.generateHash = function(password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};

	// checking if password is valid
	userSchema.methods.validPassword = function(password) {
		return bcrypt.compareSync(password, this.password);
	};

	userModel = mongooseDB.model('Users', userSchema);
	that.userModel = userModel;

	that.clearDB = function() {
		that.userModel.remove({}, function() {
			dbgLog('collection removed');
		});
	};

	that.findById = function(id, cb) {
		userModel.findById(id, function(err, user) {
			cb(err, user);
		});
	};


	that.addJobFile = function(id, filename, cb) {
		userModel.findById(id, function(err, user) {
			/*
			if (err) {

			} else {

			}
			*/
			cb(err, user);
		});
	};

	that.addJob = function(user, jobobj) {
		jobsInterface.addJob(user._id, {
			jobtitle: jobobj.jobtitle,
			tags: [],
			fullimage: jobobj.fullimage
		}, function(job) {
			user.jobs.push(job._id);
			user.save(function(err) {
				if (err) {
					errorLog('Could not save', jobobj.jobtitle, err);
				}
			});
		});
	};

	that.removeJob = function(user, jobid) {

	};

	that.getJobs = function(user) {

	};


	that.updateUser = function(id, obj, cb) {
		userModel.findById(id, function(err, doc) {
			if (err) {
				that.addUser(obj, cb);
			} else {
				for (var i = 0; i < fields.length; ++i) {
					var key = fields[i];
					doc[key] = obj[key] || doc[key];
					dbgLog('update', key, 'to', doc[key]);
				}
				doc.save(function(err) {
					if (err) {
						errorLog('Could not update ', doc.email);
						cb({
							'error': true,
							'message': 'Could not update ' + doc.email
						});
					} else {
						cb({
							'error': false,
							'message': 'Updated ' + doc.email
						});
					}
				});
			}
		});
	};

	that.login = function(email, password, cb) {
		if (typeof email !== 'string' || email.length < 5) {
			cb({
				'error': true,
				'message': 'Wrong email',
				'user': null
			});
			return;
		}

		email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
		userModel.findOne({
			'email': email
		}, function(err, user) {
			if (err || !user) {
				cb({
					'error': true,
					'message': 'Wrong user',
					'user': null
				});
			} else {
				if (!user.validPassword(password)) {
					cb({
						'error': true,
						'message': 'Wrong password',
						'user': null
					});
				} else {
					cb({
						'error': false,
						'message': 'Correct password',
						'user': user
					});
				}
			}
		});
	};

	that.addUser = function(email, password, cb) {
		if (typeof email !== 'string' || email.length < 5) {
			cb({
				'error': true,
				'message': 'Wrong email',
				'user': null
			});
			return;
		}

		dbgLog("Add ", email);

		var newUser = new userModel();
		newUser.email = email.toLowerCase();
		newUser.password = newUser.generateHash(password);
		newUser.save(function(err) {
			if (err) {
				errorLog('Could not add user ', email);
				cb({
					'error': true,
					'message': 'Could not add user ' + email
				});
			} else {
				dbgLog("Added ", email);
				cb({
					'error': false,
					'message': 'Added user ' + email,
					'user': newUser
				});
			}
		});
	}; // addUser

	return that;
}

function UserInterface() {
	"use strict";
	var singleton = null;

	return function(url) {
		if (singleton === null) {
			singleton = Users(url);
		}
		return singleton;
	};
}


module.exports = UserInterface();