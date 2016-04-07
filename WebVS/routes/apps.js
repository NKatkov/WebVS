var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;
var Ports = require('../db').Ports;
var running = require('is-running')
var async = require('async');
var multer  = require('multer')
var upload = multer({ dest: './public/uploads/' })
var exec = require('child_process').exec

router.get('/', function (req, res) {
	if (req.user) {
		var sel={}
		if (!req.user.IsAdmin()) sel:{ UserOwner: req.user.username}
		Application.find(sel, function (err, app_list) {
			res.render('apps', { title: 'Личный кабинет', List: app_list });
		});
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
			newApp.Port = result.Port
			newApp.save({}, function (err) {
				if(err){console.log('Error: ' + err)}
				async.waterfall([
					function(callback){
						ch = exec("sudo -u " + newApp.UserOwner + ' unzip ' + req.file.path + " -d " + newApp.Path,function(error, stdout, stderr){
							if(!error){
								callback(null, true);
							}else{
								callback("101", false);
							}
						})
					},
					function(arg1, callback){
						var text = "'cache=" + "/home/" + newApp.UserOwner +"/.npm\r\nuserconfig=" + "/home/" + newApp.UserOwner +"/.npmrc'";
						ch = exec("sudo -u " + newApp.UserOwner + ' echo -E ' + text + " >> " + newApp.Path + ".npmrc",function(error, stdout, stderr){
							if(!error && arg1){
								callback(null, true);
							}else{
								callback("112", false);
							}
						})
					},
					function(arg1, callback){
						ch = exec("sudo -u " + newApp.UserOwner + " npm install",{cwd:newApp.Path},function(error, stdout, stderr){
							if(!error && arg1){
								callback(null, true);
							}else{
								callback("425", false);
							}
						})
					},
				], function (err, result) {
					console.log(result)
					if(result){
						res.redirect('/app');
					}else{
						res.render('app_install',{error : "При установке приложения возникла ошибка " + err });
					}
				});
			});
		})
	} else {
		res.redirect('/auth');
	}
});

router.get('/:id/del', function (req, res) {
	if (req.user) {
		AppKill(req);
		Application.findOneAndRemove({ _id: req.params.id }, function (err, app_del) {
			if(err) console.log('Error: ' + err)
			if (err) throw err;
			if (app_del) {
				var newPorts = new Ports({ Port: app_del.Port })
				newPorts.save({}, function (err) {
					console.log('Error: ' + err)
					ch = exec("sudo -u " + app_del.UserOwner + " rm -rf " + app_del.Path,function(error, stdout, stderr){
						if(err){console.log('Error: ' + err)}
					})
					
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
            if(err){console.log('Error: ' + err)}
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