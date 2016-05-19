var express = require('express');
var router = express.Router();
var Application = require('../db').Application;
var exec = require('child_process').exec;
var async = require('async');

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

router.post('/install', function (req, res) {
	if (req.user) {
		console.log(req.body)
		Application.find({ _id: req.body.app_id }, function (err, app_list) {
			if(app_list[0].UserOwner == req.user.username && req.user.IsAdmin()){
				async.waterfall([
					function(callback){
						ch = exec("sudo -u " + app_list[0].UserOwner + " npm install " + req.body.npm_name + "@'" + req.body.ver + "' --save",{cwd:app_list[0].Path},function(error, stdout, stderr){
							console.log(error)
							if(!error){
								callback(null, true);
							}else{
								callback("0594", false);
							}
						})
					},
					function(arg1, callback){
						require('fs').readFile( app_list[0].Path + 'package.json', 'utf8', function (err, data) {
							if (err) throw err;
							app_list[0].Package = JSON.parse(data);
							app_list[0].save({},function(error){
								console.log(app_list)
								if(!error && arg1){
									callback(null, app_list);
								}else{
									callback("0595", false);
								}
							})

						});
					}
				], function (err, result) {
					
					var sel={}
					if (!req.user.IsAdmin()) sel:{ UserOwner: req.user.username}
					Application.find(sel, function (err, app_list) {
						res.render('npm', {List: app_list,error:err, status: "NPM пакет " + req.body.npm_name + " версии " + req.body.ver + " успешно установлен" });
					});			
				})
			}else{
				Application.find(sel, function (err, app_list) {
					res.render('npm', {List: app_list,error:'У вас нет прав на это'});
				});				
			}
		});
	} else {
		res.redirect('/auth');
	}
});

router.post('/del', function (req, res) {
	if (req.user) {
		console.log(req.body)
		Application.find({ _id: req.body.app_id }, function (err, app_list) {
			if(app_list[0].UserOwner == req.user.username && req.user.IsAdmin()){
				console.log(app_list)
				async.waterfall([
					function(callback){
						ch = exec("sudo -u " + app_list[0].UserOwner + " npm uninstall " + req.body.npm_name + " --save",{cwd:app_list[0].Path},function(error, stdout, stderr){
							if(!error){
								callback(null, true);
							}else{
								callback("0594", false);
							}
						})
					},
					function(arg1, callback){
						require('fs').readFile( app_list[0].Path + 'package.json', 'utf8', function (err, data) {
							if (err) throw err;
							app_list[0].Package = JSON.parse(data);
							app_list[0].save({},function(error){
								console.log(app_list)
								if(!error && arg1){
									callback(null, app_list);
								}else{
									callback("0595", false);
								}
							})

						});
					}
				], function (err, result) {
					var sel={};
					if (!req.user.IsAdmin()) sel:{ UserOwner: req.user.username}
					Application.find(sel, function (err, app_list) {
						res.render('npm', {List: app_list,error:err, status: "NPM пакет " + req.body.npm_name + " успешно удален" });
					});	
					
				})
			}else{
				Application.find(sel, function (err, app_list) {
					res.render('npm', {List: app_list,error:'У вас нет прав на это'});
				});				
			}
			
		});
	} else {
		res.redirect('/auth');
	}
});

//npm --depth=0 list -json


module.exports = router;