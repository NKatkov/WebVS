var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;
var Ports = require('../db').Ports;
var running = require('is-running')

router.get('/', function (req, res) {
	if (req.user) {
		if (req.user.IsAdmin()) {
			Application.find({}, function (err, app_list) {
				res.render('apps', { title: 'Личный кабинет', List: app_list });
			});
		} else {
			Application.find({ UserOwner: req.user.username }, function (err, app_list) {
				res.render('apps', { title: 'Личный кабинет', List: app_list });
			});
		}
	} else {
		res.redirect('/auth');
	}
});

router.get('/add_ports', function (req, res) {
	if (req.user) {
		for (i = 0; i < 100; i++) {
			var newPorts = new Ports({ Port: 9000 + i })
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
			UserOwner: req.user.username,
			IP: '127.0.0.1',
			PID: '',
			Path: './users/xklx/',
			StartupFile: 'app.js',
		})
		
		Ports.findOneAndRemove({}, function (err, result) {
			console.log(result)
			newApp.Port = result.Port
			//newApp.Port = "8081"
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
		AppDisable(req)
		Application.findOneAndRemove({ _id: req.params.id }, function (err, app_del) {
			console.log('Error: ' + err)
			if (err) throw err;
			if (app_del != null) {
				var newPorts = new Ports({ Port: app_del.Port })
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

router.get('/:id/enable', function (req, res) {
	if (req.user) {
		Application.findOne({ _id: req.params.id }, function (err, app) {
			if (!err && app != null) {
				var fs = require('fs'),
					spawn = require('child_process').spawn,
					child = spawn('node', [app.Path + app.StartupFile, app.Port]),
					logStream = fs.createWriteStream(app.Path + 'logFile.log', { flags: 'a' });

				child.stdout.pipe(logStream);
				child.stderr.pipe(logStream);
				child.on('close', function (code) {
					console.log('child process exited with code ' + code);
				});
				
				app.PID = child.pid
				app.save({}, function (err) {
					console.log('Error: ' + err)
					console.log('app: ' + app)
				})
				res.redirect('/app');
			} else {
				Application.find({ UserOwner: req.user.username }, function (err, app_list) {
					res.render('apps', { title: 'Личный кабинет', error: "Произошла ошибка при включении приложения id: " + req.params.id , List: app_list });
				});
			}
		})
	} else {
		res.redirect('/auth');
	}
});

router.get('/:id/disable', function (req, res) {
	if (req.user) {
		AppDisable(req)
		Application.find({ UserOwner: req.user.username }, function (err, app_list) {
			res.render('apps', { title: 'Личный кабинет', error: "Произошла ошибка при выключении приложения id: " + req.params.id , List: app_list });
		});
	} else {
		res.redirect('/auth');
	}
});

AppDisable = function (data) {
	Application.findOne({ _id: data.params.id }, function (err, app) {
		if (!err && app != null) {
			console.log(app)
			if (app.UserOwner == data.user.username || data.user.IsAdmin()) {
				if (running(app.PID)) {
					process.kill(app.PID, signal = 'SIGTERM')
				}
			}
		}
	})

}

module.exports = router;