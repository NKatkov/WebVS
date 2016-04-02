var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Converter = require("csvtojson").Converter;

router.get('/', function (req, res, next) {
    if (!req.user) {
        res.render('auth', { error: "Пользователь не авторизован" });
    } else {
        if (req.user.IsAdmin()) {
            res.render('package', { menu: 'none', title: 'Управление пакетами ', User: req.user });
        } else {
            res.redirect('/');
        }
    }
});

router.get('/list', function (req, res) {
    if (!req.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('dpkg --list', function (error, stdout, stderr) {
				var rePattern = new RegExp(/ii\s*(\b[a-z0-9\:\.\-\~\+\']*)\s+(\b.*?)\s+\b.*?\s+(.*?)\s*$/mi);
				var list_package = {}
				stream.once('open', function(fd) {
				  stream.write(stdout);
				  stream.end();
				})
				var str = stdout.split(/\r?\n/)
				var n = 0
				for(i=0;i<str.length;i++){
					var arrMatches = str[i].match(rePattern);
					if(arrMatches){
						//console.log(arrMatches[0])
						n += 1
						list_package["Package_" + n] = {
							name : arrMatches[1],
							version : arrMatches[2],
							description : arrMatches[3]
						}
					}
                }
                res.render('package', {List: list_package, status: stdout });
				
				//arrMatches[i] = {name: arrMatches[0]}
				//
				//}
				//console.log(arrMatches)
				//converter.fromString(arrMatches, function (err, result) {
				//});
                //res.render('srv', { title: 'Управление сервером ', status: stdout });
            });
    } else {
        res.redirect('/auth');
    }
});

router.get('/install', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        res.render('package', {menu:'install', title: 'Управление сервером ',status: 'ok'});
    } else {
        res.redirect('/auth');
    }
});

router.post('/install', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
		console.log(req.body.packname)
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('sudo apt-get install -y  ' + req.body.packname , function (error, stdout, stderr) {
				var str = stdout.split(/$/img)
                res.render('package', {menu:'install', title: 'Управление сервером ', status: str, errstd:stderr  });
            });
    } else {
        res.redirect('/auth');
    }
});

router.get('/upgrade', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
		res.render('package', {menu:'upgrade', title: 'Управление сервером '});
    } else {
        res.redirect('/auth');
    }
});

router.post('/upgrade', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('sudo apt-get -y upgrade ' + req.body.packname, function (error, stdout, stderr) {
				var str = stdout.split(/$/img)
                res.render('package', {menu:'upgrade', title: 'Управление сервером ', status: str, errstd:stderr  });
			})
    } else {
        res.redirect('/auth');
    }
});

router.get('/update_all', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
		res.render('package', {menu:'update_all', title: 'Управление сервером '});
    } else {
        res.redirect('/auth');
    }
});

router.post('/update_all', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('sudo apt-get -y update ', function (error, stdout, stderr) {
				var str = stdout.split(/$/img)
                res.render('package', {menu:'update_all', title: 'Управление сервером ', status: str, errstd:stderr  });
			})
    } else {
        res.redirect('/auth');
    }
});

router.get('/uninstall', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        res.render('package', {menu:'uninstall', title: 'Управление сервером ',status: 'ok'});
    } else {
        res.redirect('/auth');
    }
});

router.post('/uninstall', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
		console.log(req.body.packname)
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('sudo apt-get remove -y  ' + req.body.packname, function (error, stdout, stderr) {
				var str = stdout.split(/$/img)

                res.render('package', {menu:'uninstall', title: 'Управление сервером ', status: str, errstd:stderr  });
            });
    } else {
        res.redirect('/auth');
    }
});

module.exports = router;