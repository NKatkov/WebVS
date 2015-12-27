var express = require('express');
var router = express.Router();
var db = require('../db').db;
var User = require('../db').User;

router.get('/', function (req, res,next) {
    var sess = req.session
    if (!sess.user) {
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
                //console.log(users)
            })
        } else {
            User.authorize(req.body.login, req.body.pass, function (err, User) {
                if (err) {
                    if (err instanceof AuthError) {
                        return next(new HttpError(403, err.message));
                    } else {
                        return next(err);
                    } 
                }
                req.session.user = User._id;
                res.redirect('/');
            })
            return
        }
    }
    res.redirect('/login');
});


module.exports = router;