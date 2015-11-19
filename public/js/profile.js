/* global io, log, requireJS */
/* exported InitRealtime */

/**
 * set up realtime connection with server
 */

"use strict";

function InitProfile() {

	var that = {};
	that.setup = function() {
		console.log('Profile');
		http('get', '/api/profile');
	};

	return that;
}

window.addEventListener('load', function() {
	InitProfile().setup();
});

