var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    if (req.user) {
        res.render('srv', { title: 'Управление сервером ', User: req.user });
    } else {
        res.render('auth', { error: "Пользователь не авторизован" });
    }
});

router.get('/reboot', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        var exec = require('child_process').exec,
            child = exec('chcp 65001 | sudo reboot -h now', function (error, stdout, stderr) {
				console.log(error)
				console.log(stdout)
				console.log(stderr)
                res.render('srv', { title: 'Управление сервером ', status: stdout });
            });
    } else {
        res.redirect('/auth');
    }
});

router.get('/shutdown', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        var exec = require('child_process').exec,
            child = exec('sudo shutdown -h now', function (error, stdout, stderr) {
                res.render('srv', { title: 'Управление сервером ', status: stdout });
            });
    } else {
        res.redirect('/auth');
    }
});

module.exports = router;