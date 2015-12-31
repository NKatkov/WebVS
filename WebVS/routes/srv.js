var express = require('express');
var router = express.Router();
var User = require('../db').User;

router.get('/', function (req, res, next) {
    var sess = req.session
    if (!sess.user) {
        res.render('login', { error: "������������ �� �����������" });
    } else {
        res.render('srv', { title: '���������� �������� ', User: sess.user });
    }
});

