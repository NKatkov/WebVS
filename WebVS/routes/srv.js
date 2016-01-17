var express = require('express');
var router = express.Router();
var Converter = require("csvtojson").Converter;
var User = require('../db').User;

router.get('/', function (req, res, next) {
    var sess = req.session
    if (!sess.user) {
        res.render('auth', { error: "Пользователь не авторизован" });
    } else {
        res.render('srv', { title: 'Управление сервером ', User: sess.user });
    }
});

router.get('/reboot', function (req, res) {
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

router.get('/shutdown', function (req, res) {
    var sess = req.session
    if (sess.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('chcp 65001 | echo shutdown', function (error, stdout, stderr) {
                res.render('srv', { title: 'Управление сервером ', status: stdout });
            });
    } else {
        res.redirect('/auth');
    }
});

module.exports = router;