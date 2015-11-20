// load the things we need
var mongoose = require('mongoose');


GLOBAL.searchpaths(module);
var log = require('log');
var moduleName = "jobs]:";
var errorLog = log.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
// var warningLog = log.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
// var infoLog = log.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
var dbgLog = log.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);


function Jobs() {
	"use strict";
	var that = {};
	var mongooseDB = require('db_connection')();

	var jobSchema = new mongoose.Schema({
		title: String,
		creator: {
			type: String,
			required: true
		},
		tags: [{
			tag: String,
		}],
		date: {
			type: Date,
			default: Date.now
		},
		fullimage: String,
		smallimage: String
	});

	var jobModel = mongooseDB.model('Jobs', jobSchema);

	that.clearDB = function() {
		that.jobModel.remove({}, function() {
			console.log('collection removed');
		});
	};

	that.addJob = function(userid, jobobj, cb) {
		var newJob = new jobModel(jobobj);
		newJob.creator = userid;
		newJob.save(function(err) {
			if (err) {
				errorLog('Could not add job ', jobobj.title);
			} else {
				cb(newJob);
			}
		});
	};


	that.findById = function(id, cb) {
		cb = cb || function(err, job) {
			if (err) {
				errorLog('did not find job with id', id);
			} else {
				dbgLog('found find job with title', job.title);
			}
		};
		jobModel.findById(id, cb);
	};

	return that;
}

function JobsInterface() {
	"use strict";
	var singleton = null;

	return function() {
		if (singleton === null) {
			singleton = Jobs();
		}
		return singleton;
	};
}


module.exports = JobsInterface();