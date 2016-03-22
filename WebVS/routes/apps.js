var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;
var Ports = require('../db').Ports;

router.get('/', function (req, res) {
	if (req.user) {
		Application.find({UserOwner: req.user.username}, function (err, app_list) {
			res.render('apps', { title: 'Личный кабинет', List: app_list });
		});
	} else {
		res.redirect('/auth');
	}
});

router.get('/add_ports', function (req, res) {
	if (req.user) {
		for (i = 0; i < 100; i++) {
			var newPorts = new Ports({Port: 9000 + i})
			newPorts.save({}, function (err) {
				console.log('Error: ' + err)
			});
		}
		res.redirect('/app');
	} else {
		res.redirect('/auth');
	}
});

router.get('/install', function (req, res) {
	if (req.user) {
		var newApp = new Application({
			AppName: 'Test',
			UserOwner: 'admin',
			IP: '127.0.0.1',
			Path: './users/xklx/',
			StartupFile: 'app.js',
		})
		
		Ports.findOneAndRemove({}, function (err, result) { 
			console.log(result)
			newApp.Port = result.Port
			newApp.save({}, function (err) {
				console.log('Error: ' + err)
				res.redirect('/app');
			});
		})
	} else {
		res.redirect('/auth');
	}
});

router.get('/:id/del', function (req, res) {
	if (req.user) {
		console.log(req.params.id);
		Application.findOneAndRemove({ _id: req.params.id }, function (err, app_del) {
			console.log('Error: ' + err)
			if (err) throw err;
			if (app_del != null) {
				var newPorts = new Ports({ Port: app_del.Port})
				newPorts.save({}, function (err) {
					console.log('Error: ' + err)
				});
				res.redirect('/app');
			} else {
				Application.find({ UserOwner: req.user.username }, function (err, app_list) {
					res.render('apps', { title: 'Личный кабинет', status: "Произошла ошибка при удалении приложения: " , List: app_list });
				});
				
			}
		});
	} else {
		res.redirect('/auth');
	}
});

module.exports = router;