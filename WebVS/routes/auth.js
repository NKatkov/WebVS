﻿var express = require('express');
var router = express.Router();
var User = require('../db').User;

//	  '/auth/'
router.get('/', function (req, res, next) {
    if (!req.user) {
        res.render('auth');
    } else {
        res.redirect('/');
    }
});
//     '/auth/login'
router.post('/login', function (req, res, next) {
    if (req.body.login && req.body.pass) {
        User.authorize(req.body.login, req.body.pass, function (err, User) {
            if (err) {
                res.render('auth', { error: err });
            } else {
                req.session.user = User || false;
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
				var text = "cache=" + "/home/" + req.body.login +"/.npm\r\nuserconfig=" + "/home/" + req.body.login +"/.npmrc"
				var fs = require('fs');
				var spawnSync = require('child_process').spawnSync,
				child = spawnSync('sudo', ["useradd", req.body.login, "-g", "WebApi", "-m", "-p", req.body.pass])
				fs.writeFile("/home/" + req.body.login +"/.npmrc", text, function(err) {});
				res.render('auth', { title: 'Управление пользователями', status: "Пользователь " + req.body.login + " успешно зарегистрирован" });
            } else {
                res.render('users', { title: 'Управление пользователями', status: "Error:reg(newUser.save)" });
            }
        });
        return
    }
    res.redirect('/auth');
});

module.exports = router;