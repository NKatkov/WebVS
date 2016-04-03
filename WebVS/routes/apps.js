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
		res.render('app_install');
	} else {
		res.redirect('/auth');
	}
});

router.post('/install', function (req, res) {
	if (req.user) {
		var newApp = new Application({
			AppName: req.body.AppName,
			UserOwner: req.user.username,
			IP: 'nhost.cloudapp.net',
            PID: '',
            Enable:false,
			Path: '/home/' + req.user.username + "/",
			StartupFile: req.body.AppJS,
		})
		var spawn = require('child_process').spawn,
		child = spawn("sudo",["-u",req.user.username,'npm',"install"],{cwd:"/home/" + req.user.username})
		
		console.log(child.cwd)
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
		AppKill(req)
		Application.findOneAndRemove({ _id: req.params.id }, function (err, app_del) {
			console.log('Error: ' + err)
			if (err) throw err;
			if (app_del) {
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

router.get('/:id/run', function (req, res) {
	if (req.user) {
        Application.findOne({ _id: req.params.id }, function (err, app) {
            console.log()
            if (!err && app) {
                var PID = app.Start()
                if (PID > 0) {
                    res.redirect('/app');
                } else {
                    Application.find({ UserOwner: req.user.username }, function (err, app_list) {
                        res.render('apps', { title: 'Личный кабинет', error: "Произошла ошибка при включении приложения id: " + req.params.id , List: app_list });
                    });
                }
            }
		})
	} else {
		res.redirect('/auth');
	}
});

router.get('/:id/stop', function (req, res) {
    if (req.user) {
        AppKill(req)
        res.redirect('/app');
	} else {
		res.redirect('/auth');
	}
});

router.get('/:id/enable', function (req, res) {
    if (req.user) {
        Application.findOne({ _id: req.params.id }, function (err, app) {
            if (!err && app) {
                if (app.UserOwner == req.user.username || req.user.IsAdmin()) {
                    app.Enable = true;
                    app.save({}, function (err) {
                        console.log('Error: ' + err)
                        console.log('app: ' + app)
                        res.redirect('/app');
                    })
                }
            }
        })
    } else {
        res.redirect('/auth');
    }
});

router.get('/:id/disable', function (req, res) {
    if (req.user) {
        Application.findOne({ _id: req.params.id }, function (err, app) {
            if (!err && app) {
                if (app.UserOwner == req.user.username || req.user.IsAdmin()) {
                    if (running(app.PID)) {
                        app.Stop()
                    }
                    app.Enable = false;
                    app.save({}, function (err) {
                        console.log('Error: ' + err)
                        console.log('app: ' + app)
                        res.redirect('/app');
                    })
                }
            }
        })
    } else {
        res.redirect('/auth');
    }
});

AppKill = function (data) {
	Application.findOne({ _id: data.params.id }, function (err, app) {
		if (!err && app != null) {
			console.log(app)
			if (app.UserOwner == data.user.username || data.user.IsAdmin()) {
				if (running(app.PID)) {
					app.Stop()
				}
			}
		}
	})

}

module.exports = router;