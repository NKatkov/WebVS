var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;

router.get('/', function (req, res) {
    if (req.user) {
		Application.find({UserOwner: req.user.username}, function (err, app_list) {
			res.render('apps', { title: 'Личный кабинет', List: app_list });
		});
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
        
        Application.count({}, function (err, result) {
            console.log(result)
            newApp.Port = 9000 + result;
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