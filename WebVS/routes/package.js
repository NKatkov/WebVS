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
            child = exec('chcp 65001 | echo reboot', function (error, stdout, stderr) {
                res.render('srv', { title: 'Управление сервером ', status: stdout });
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