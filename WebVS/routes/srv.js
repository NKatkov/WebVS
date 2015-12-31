var express = require('express');
var router = express.Router();
var User = require('../db').User;

router.get('/', function (req, res, next) {
    var sess = req.session
    if (!sess.user) {
        res.render('login', { error: "Пользователь не авторизован" });
    } else {
        res.render('srv', { title: 'Управление сервером ', User: sess.user });
    }
});

