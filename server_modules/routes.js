///////////////////////////////////////////////////////////////////////////////
// built-in module

'use strict';

var fs = require('fs');
var net = require('net');
var util = require('util');
var url = require('url');

GLOBAL.searchpaths(module);

var logFuncs = require('log');
var moduleName = "Routes]:";
var errorLog = logFuncs.xlog("[Error in " + moduleName, "FgWhite", "BgRed", 0);
var warningLog = logFuncs.xlog("[Warning " + moduleName, "FgRed", "BgWhite", 1);
var infoLog = logFuncs.xlog("[Info in " + moduleName, "FgGreen", "BgBlack", 2);
var dbgLog = logFuncs.xlog("[Debug " + moduleName, "FgBlue", "BgWhite", 3);

var para = {};
para.title = 'Home';

// Links in key/value form
// key is the route; value is the title
var insideLinks = {
  '/logout': 'Logout',
  '/profile': 'Profile',
};

var outsideLinks = {
  '/': 'Home',
  '/login': 'Login',
  '/signup': 'Sign Up'
};

para.links = outsideLinks;


module.exports = function(app, passport, maindir) {

  app.use(function(req, res, next) {
    para.id = req.url;		// used in layout.jade to determine the active menu
    next(); // do not stop here
  });


  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function(req, res) {
    res.render('home', para );
  });


  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function(req, res) {
  	para.user = req.user;
    res.render('profile', para );
  });

  app.get('/grid', isLoggedIn, function(req, res) {
    para.title = 'Grid';
    res.render('grid', para);
  });


  app.get('/images', isLoggedIn, function(req, res) {
    para.title = 'Images';
    res.render('img', para);
  });

  ///////////////////////////////////////////////////////////////////////////////
  // Input Form
  app.route('/ideas')
    .get(isLoggedIn, function(req, res) {
      para.title = 'Your Ideas';
      para.ideas = [{
      	title: 'Test 1',
      	message: 'Message 1'
      }, {
      	title: 'Test 2',
      	message: 'Message 2'
      }
      ];
      res.render('ideas', para);
    })
    .post(function(req, res) {
      dbgLog('user ' + req.body.user.name + ' posts ' + req.body.user.post);
      res.redirect("ideas");
    });


  // Test on command-line
  // curl -F "image=@/home/adr/Tmp/link.txt" localhost:8080/fileupload
  app.route('/fileupload')
    .get(isLoggedIn, function(req, res) {
      para.title = 'File';
      res.render('fileupload', para);
    })
    .post(function(req, res) {
      var fstream;
      req.pipe(req.busboy);
      req.busboy.on('file', function(fieldname, file, filename) {
        dbgLog("Uploading: " + filename);
        fstream = fs.createWriteStream(maindir + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function() {
          res.redirect('back');
        });
      });
    });


  app.get('/nested', function(req, res) {
    res.render('nested', para);
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
    res.render('login', para );
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
    res.render('signup', para);
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));


  // google ---------------------------------

  // send to google to do the authentication
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // =============================================================================
  // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
  // =============================================================================

  // locally --------------------------------
  app.get('/connect/local', function(req, res) {
    res.render('connect-local', para );
  });
  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));


  // google ---------------------------------

  // send to google to do the authentication
  app.get('/connect/google', passport.authorize('google', {
    scope: ['profile', 'email']
  }));

  // the callback after google has authorized the user
  app.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // google ---------------------------------
  app.get('/unlink/google', isLoggedIn, function(req, res) {
    var user = req.user;
    user.google.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // at the end, otherwise get('/') does not work
  var express = require('express');
  app.use(express.static(maindir + '/public'));
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