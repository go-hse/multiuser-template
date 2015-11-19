// load the things we need

"use strict";
var path = require('path');
var fs = require('fs');
var childProcess = require('child_process');
var spawn = childProcess.spawn;

GLOBAL.searchpaths(module);
var log = require('log');

log.setErrorLevel(5);

var moduleName = "filehandler]:";
var errorLog = log.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
var warningLog = log.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
var infoLog = log.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
var dbgLog = log.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);


function FileHandler(maindir) {
	var that = {};
	// infoLog('FileHandler:', maindir);

	that.getMainDir = function() {
		return maindir;
	};

	that.addFile = function(userid, filename) {
		var dir = path.join(maindir, 'userfiles', userid);
		var full = path.join(dir, filename);
		// dbgLog("FileHandler:addFile ", full);
		return full;
	};

	that.addUserDir = function(userid) {
		var dir = path.join(maindir, 'userfiles', userid);
		fs.stat(dir, function(err, stats) {
			if (err) {
				fs.mkdir(dir, function(err) {
					if (err) {
						errorLog('Error in addUserDir', err);
					} 
				});
			} 
		});
	};


	that.PDF2PNG = function(filename) {
		var proc;
		// we use ImageMagick "convert"-command for conversion from PDF to PNG
		if (process.env.IMGMAG) {
			infoLog('ImageMagic Converter', process.env.IMGMAG);
			proc = spawn(process.env.IMGMAG, ['-density', '300', '-quality', '100', '-flatten', filename, filename+'.png']);
		} else {
			infoLog('env IMGMAG is not defined');
		}
	}

	return that;
}

function FileHandlerInterface() {
	var singleton = null;

	return function(maindir) {
		if (singleton === null) {
			singleton = FileHandler(maindir);
		} 
		return singleton;
	}
}


module.exports = FileHandlerInterface();