var express = require('express');
var router = express.Router();
var db = require('../db').db;
var User = require('../db').User;

router.get('/', function (req, res, next) {
    var sess = req.session
    if (!sess.user) {
        res.render('auth', { error: "Пользователь не авторизован" });
    } else {
        res.redirect('/');
    }
});

router.post('/login', function (req, res, next) {
    if (req.body.login && req.body.pass) {
        User.authorize(req.body.login, req.body.pass, function (err, User) {
            if (err) {
                res.render('auth', { error: err });
            } else {
                req.session.user = User._id;
                res.redirect('/');
            }
        })
        return
    }
    res.redirect('/auth');
});

router.get('/logout', function (req, res) {
    var sess = req.session
    sess.destroy(function (err) {
        res.redirect('/auth');
    })
});

router.post('/reg', function (req, res, next) {
    if (req.body.login && req.body.pass) {
        var newUser = new User({ username: req.body.login, password: req.body.pass })
        newUser.save(function (err) {
            if (!err) {
                res.render('user_menu_create', { title: 'Управление пользователями', status: "Пользователь " + req.body.login + " успешно зарегистрирован" });
            } else {
                res.render('user_menu_create', { title: 'Управление пользователями', status: "Error:reg(newUser.save)" });
            }
        });
        return
    }
    res.redirect('/auth');
});


module.exports = router;