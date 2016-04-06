var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;
var Ports = require('../db').Ports;
var running = require('is-running')
var async = require('async');
var multer  = require('multer')
var upload = multer({ dest: './public/uploads/' })


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

router.post('/install',upload.single('myfile'), function (req, res) {
	if (req.user) {
		var spawn = require('child_process').spawn
		var newApp = new Application({
			AppName: req.body.AppName,
			UserOwner: req.user.username,
			IP: 'nhost.cloudapp.net',
            PID: '',
            Enable:false,
			Path: '/home/' + req.user.username + "/",
			StartupFile: req.body.AppJS,
		})
		newApp.Path += newApp._id + "/"
		Ports.findOneAndRemove({}, function (err, result) {
			console.log(result)
			newApp.Port = result.Port
			newApp.save({}, function (err) {
				console.log('Error: ' + err)
				console.log(newApp)
		
				async.waterfall([
					function(callback){
						ch = spawn("sudo",["-u",newApp.UserOwner,'unzip',req.file.path,"-d",newApp.Path])

						callback(null, 'один', 'два');
					},
					function(arg1, arg2, callback){
						var text = "cache=" + "/home/" + newApp.UserOwner +"/.npm\r\nuserconfig=" + "/home/" + newApp.UserOwner +"/.npmrc";
						var fs = require('fs');
						fs.writeFile("/home/" + newApp.UserOwner +"/.npmrc", text, function(err) {});
						callback(null, 'три');
					},
					function(arg1, callback){
						ch = spawn("sudo",["-u",newApp.UserOwner,'npm',"install"],{cwd:newApp.Path})

						callback(null, 'Готово');
					},
				], function (err, result) {
					console.log(result)
					res.redirect('/app');
				   // Сейчас результат будет равен 'Готово'    
				});
				
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