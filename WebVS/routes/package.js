var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Converter = require("csvtojson").Converter;

router.get('/', function (req, res) {
    if (req.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('dpkg --list "nano"', function (error, stdout, stderr) {
				var rePattern = new RegExp(/ii\s*(\b[a-z0-9\:\.\-\~\+\']*)\s+(\b.*?)\s+\b.*?\s+(.*?)\s*$/mi);
				var list_package = {}
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
            });
    } else {
        res.redirect('/auth');
    }
});

router.get('/install', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        res.render('package_add');
    } else {
        res.redirect('/auth');
    }
});

router.post('/add', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
		console.log(req.body.packname)
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('sudo apt-get install -y  ' + req.body.add , function (error, stdout, stderr) {
				var str = stdout.split(/$/img)
				var str2 = stdout.replace(/$/img, '"\r\n"')
				
                res.render('package', {status: str2, errstd:stderr  });
            });
    } else {
        res.redirect('/auth');
    }
});
 
router.get('/:id/upgrade', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('sudo apt-get -y upgrade ' + req.params.id , function (error, stdout, stderr) {
				var str = stdout.split(/$/img)
                res.render('package', {status: str, errstd:stderr  });
			})
    } else {
        res.redirect('/auth');
    }
});

router.get('/update_all', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('sudo apt-get -y update ', function (error, stdout, stderr) {
				var str = stdout.split(/$/img)
                res.render('package', {status: str, errstd:stderr  });
			})
    } else {
        res.redirect('/auth');
    }
});

router.get('/:name/delete', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
		console.log(req.body.packname)
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('sudo apt-get remove -y  ' + req.params.name, function (error, stdout, stderr) {
				var str = stdout.split(/$/img)

                res.render('package', {status: str, errstd:stderr  });
            });
    } else {
        res.redirect('/auth');
    }
});

module.exports = router;