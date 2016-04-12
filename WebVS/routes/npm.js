var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;
var Ports = require('../db').Ports;
var running = require('is-running')
var async = require('async');
var exec = require('child_process').exec

router.get('/', function (req, res) {
	if (req.user) {
		var sel={}
		if (!req.user.IsAdmin()) sel:{ UserOwner: req.user.username}
		Application.find(sel, function (err, app_list) {
			res.render('npm', {List: app_list });
		});
	} else {
		res.redirect('/auth');
	}
});

//npm --depth=0 list -json


module.exports = router;