var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;
var Ports = require('../db').Ports;
var running = require('is-running')
var async = require('async');
var multer  = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })
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

router.get('/ports', function (req, res) {
	if (req.user) {
		for (i = 0; i < 10; i++) {
			var newPorts = new Ports({ Port: 8081 + i })
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
			if(err){console.log('Error: ' + err)}
			async.waterfall([
				function(callback){
					ch = exec("sudo -u " + newApp.UserOwner + ' unzip ' + req.file.path + " -d " + newApp.Path,{maxBuffer: 1024 * 500},function(error, stdout, stderr){
						if(!error){
							require('fs').readFile( newApp.Path + 'package.json', 'utf8', function (err, data) {
								if (err) throw err; // we'll not consider error handling for now
								newApp.Package = JSON.parse(data);
								if(req.body.AppName == ""){newApp.AppName = newApp.Package.name}
								if(req.body.AppJS == ""){newApp.StartupFile = newApp.Package.scripts[0].start}
								
								console.log(newApp)
							});
							
							
							console.log(error)
							callback(null, true);
						}else{
							console.log(error)
							callback("101", false);
						}
					})
				},
				function(arg1, callback){
					exec("sudo -u " + newApp.UserOwner + " sh -c 'echo cache=/home/" + newApp.UserOwner + "/.npm >> /home/" + newApp.UserOwner + "/.npmrc && echo userconfig=/home/" + newApp.UserOwner + "/.npmrc >> " + newApp.Path + ".npmrc'",function(error, stdout, stderr){
						if(!error && arg1){
							callback(null, true);
						}else{
							console.log(error)
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
					newApp.save({}, function (err) {
						if(err){
							
							console.log('Error: ' + err)
							res.render('app_install',{error : "При установке приложения возникла ошибка newApp.save " + err});
						}else{
							console.log(newApp.Package.name)
							res.redirect('/app');
						}
					});
				}else{
					res.render('app_install',{error : "При установке приложения возникла ошибка " + err });
				}
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
					ch = exec("sudo rm -rf " + app_del.Path,function(error, stdout, stderr){
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