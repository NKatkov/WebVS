var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Converter = require("csvtojson").Converter;

router.get('/', function (req, res, next) {
    var sess = req.session
    if (!sess.user) {
        res.render('auth', { error: "Пользователь не авторизован" });
    } else {
        res.render('package', { title: 'Управление пакетами ', User: sess.user });
    }
});

router.get('/list', function (req, res) {
    var sess = req.session
    if (sess.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('dpkg --list', function (error, stdout, stderr) {
				var rePattern = new RegExp(/ii\s*(\b[a-z0-9\:\.\-\~\+\']*)\s+(\b.*?)\s+\b.*?\s+(.*?)\s*$/mi);
				var list_package = {}
				
				var fs = require('fs');
				var stream = fs.createWriteStream("my_file.txt");
				stream.once('open', function(fd) {
				  stream.write(stdout);
				  stream.end();
				})
				var str = stdout.split(/\r?\n/)
				for(i=0;i<str.length;i++){
					var arrMatches = str[i].match(rePattern);
					
					if(arrMatches){
						//console.log(arrMatches[0])
						list_package["Package_" + i] = {
							name : arrMatches[1],
							version : arrMatches[2],
							description : arrMatches[3]
						}
					}
				}
				res.json(list_package)
				
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
    var sess = req.session
    if (sess.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('chcp 65001 | echo reboot', function (error, stdout, stderr) {
                res.render('srv', { title: 'Управление сервером ', status: stdout });
            });
    } else {
        res.redirect('/auth');
    }
});
router.get('/update', function (req, res) {
    var sess = req.session
    if (sess.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('chcp 65001 | echo reboot', function (error, stdout, stderr) {
                res.render('srv', { title: 'Управление сервером ', status: stdout });
            });
    } else {
        res.redirect('/auth');
    }
});
router.get('/update_all', function (req, res) {
    var sess = req.session
    if (sess.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('chcp 65001 | echo reboot', function (error, stdout, stderr) {
                res.render('srv', { title: 'Управление сервером ', status: stdout });
            });
    } else {
        res.redirect('/auth');
    }
});
router.get('/uninstall', function (req, res) {
    var sess = req.session
    if (sess.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('chcp 65001 | echo reboot', function (error, stdout, stderr) {
                res.render('srv', { title: 'Управление сервером ', status: stdout });
            });
    } else {
        res.redirect('/auth');
    }
});

module.exports = router;