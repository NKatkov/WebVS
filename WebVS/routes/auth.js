var express = require('express');
var router = express.Router();
var User = require('../db').User;

router.get('/', function (req, res, next) {
    if (!req.user) {
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
                console.log(User);
                //req.session.user = User._id;
                req.session.user = User || false;

                //req.session.nick = User.username;
				//req.session.role = User.role;
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
        var newUser = new User({ username: req.body.login, password: req.body.pass, role: req.body.role })
        newUser.save(function (err) {
            if (!err) {
                if (req.session.user) {
                    res.render('users', { title: 'Управление пользователями', status: "Пользователь " + req.body.login + " успешно зарегистрирован" });
                } else {
                    res.render('auth', { title: 'Управление пользователями', status: "Пользователь " + req.body.login + " успешно зарегистрирован" });
                }
            } else {
                res.render('users', { title: 'Управление пользователями', status: "Error:reg(newUser.save)" });
            }
        });
        return
    }
    res.redirect('/auth');
});

module.exports = router;