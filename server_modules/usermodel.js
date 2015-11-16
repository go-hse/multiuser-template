// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');


GLOBAL.searchpaths(module);
var log = require('log');
log.setErrorLevel(5);

var moduleName = "users]:";
var errorLog = log.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
var warningLog = log.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
var infoLog = log.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
var dbgLog = log.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);


function Users(url) {
	"use strict";
	var that = {};
	var userModel = null;

	var mongooseDB = mongoose.createConnection(url);
	mongooseDB.on('error', console.error.bind(console, 'connection error:'));

	mongooseDB.once('open', function() {
		infoLog('db', url, 'is open');
	});

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
		that.userModel.remove({}, function(err) {
			console.log('collection removed')
		});
	};

	that.updateUser = function(obj, cb) {
		cb = cb || function(res) {};
		userModel.findOne({
			email: obj.email
		}, function(err, doc) {
			if (err) {
				that.addUser(obj, cb);
			} else {
				for (var i = 0; i < fields.length; ++i) {
					var key = fields[i];
					doc[key] = obj[key] || doc[key];
				}
				doc.save(function(err) {
					if (err) {
						errorLog('Could not update ', obj.email);
						cb({
							'error': true,
							'message': 'Could not update ' + obj.email
						});
					} else {
						cb({
							'error': false,
							'message': 'Updated ' + obj.email
						});
					}
				});
			}
		});
	};

	that.addUser = function(obj, cb) {
		dbgLog("Add ", obj.email);

		var newUser = new userModel();
		newUser.email = obj.email;
		newUser.password = newUser.generateHash(obj.password);
		newUser.save(function(err) {
			if (err) {
				errorLog('Could not add user ', obj.email);
				cb({
					'error': true,
					'message': 'Could not add user ' + obj.email
				});
			} else {
				dbgLog("Added ", obj.email);
				cb({
					'error': false,
					'message': 'Added user ' + obj.email
				});
			}
		});
	}; // addUser

	return that;
}


module.exports = Users;