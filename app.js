/**
 * Simple App using the express framework
 *
 */
'use strict';

var env = process.argv[2] || process.env.NODE_ENV || 'development';
// var mongourl = process.argv[3] || process.env.NODE_DB || 'mongodb://localhost/default';
var port = process.env.PORT || 8080;
var os = require('os');
var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');



GLOBAL.searchpaths = (function(mod) {
	var searchdirs = [
		path.resolve(__dirname, "public/js"),
		path.resolve(__dirname, "server_modules"),
	];
	// module is not global!
	return function(mod) {
		for (var idx = 0; idx < searchdirs.length; ++idx) {
			mod.paths.push(searchdirs[idx]);
		}
	};
}());

GLOBAL.searchpaths(module);

var logFuncs = require('log');
logFuncs.setErrorLevel(4); // all Output
var moduleName = "Server]:";
var errorLog = logFuncs.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
var warningLog = logFuncs.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
var infoLog = logFuncs.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
var dbgLog = logFuncs.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);


infoLog('Running on platform ' + os.platform() + " type: " + os.type());
infoLog('NODE_PATH:' + process.env.NODE_PATH);

/******************************************************************************
 * Static pages under public http://localhost:8080 default: index.html
 *
 */

require('passport_auth')(passport); // pass passport for configuration


var app = express();
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));

app.set('views', './views');
app.set('view engine', 'jade');

// required for passport
app.use(session({
	secret: 'thisishsesslingen.de',
	resave: true,
	saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


/******************************************************************************
	 public directories
 */

require('routes.js')(app, passport, __dirname); // load our routes and pass in our app and fully configured passport


if (env === 'development') {
	warningLog('development environment');
	app.use(express.static(__dirname + '/spec'));
	app.locals.pretty = true;
}

/******************************************************************************
	Start the HTTP server with the express-app
 */
var server = http.createServer(app);

require('reloader')(server, port);


/******************************************************************************
	The server is listening
 */
server.listen(port, function() {
	infoLog('is listening on port ' + port + ' on ' + process.platform);
});