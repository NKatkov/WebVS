var express = require('express');
var crypto = require('crypto');
var mongoose = require('mongoose');
var router = express.Router();
var db = require('../db');
var User = require('../db').user;

router.get('/', function (req, res,next) {
    var sess = req.session
    if (!sess.user) {
        //sess.user = 'Nikolay'
        
        res.render('login', { title: 'Express', User: sess.user });
    } else {
        res.redirect('/');
    }
});

router.post('/', function (req, res, next) {
    if ((req.body.login && req.body.pass) || (req.body.login2 && req.body.pass2)) {
        if (req.body.reg == "ok") {
            var newUser = new User({ username: req.body.login2, password: req.body.pass2 })
            newUser.save();
            User.find(function (err, users) {
                console.log(users)
            })
        } else {
            if (req.body.login == 'admin' && req.body.pass == '1') {
                

                //dbConnection
                //console.log(global.dbConnection.db.sessions.find());
                req.session.user = req.body.login
                res.redirect('/');
                return;
            }
        }
    }
    res.redirect('/login');
});

function hashPWD(pwd) {
    return pwdMD5 = crypto.createHash('md5')
  .update(pwd)
  .digest('hex');
}

module.exports = router;