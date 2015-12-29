var express = require('express');
var router = express.Router();
var db = require('../db').db;
var User = require('../db').User;
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema( {
    nick: { type: String, default: "hahaha" },
    pass: { type: String, match: /[a-z]/ },
    date: { type: Date },
    buff: Buffer
} );

var User = dbConnection.model("User",UserSchema)

router.get('/', function (req, res, next) {
    var sess = req.session
    if (!sess.user) {
        res.render('login', { error: "Пользователь не авторизован" });
    } else {
        res.redirect('/');
    }
});

router.post('/auth', function (req, res, next) {
    if (req.body.login && req.body.pass) {
        if (req.body.login == 'admin' && req.body.pass == '1') {
          var newUser = new User({ name: "Alice", pass: "qwe"})
	  		newUser.save(function (err, newUser) {
			if (err){
				console.log("Something goes wrong with user " + newUser.name);
			}else{
				newUser.speak();
			}
		});  
	 //dbConnection
           // console.log(dbConnection.db.sessions.find());
            req.session.user = req.body.login
            res.redirect('/');
            return;
        }

        User.authorize(req.body.login, req.body.pass, function (err, User) {
            if (err) {
                res.render('login', { error: err });
            } else {
                req.session.user = User._id;
                res.redirect('/');
            }
        })
        return

    }
    res.redirect('/login');
});

router.post('/reg', function (req, res, next) {
    if (req.body.login && req.body.pass) {
        var newUser = new User({ username: req.body.login, password: req.body.pass })
        newUser.save(function (err) {
            if (!err) {
                res.render('login', { status: "Пользователь " + req.body.login + "успешно зарегистрирован" });
            } else {
                res.render('login', { status: "Error:reg(newUser.save)" });
            }
        });
        return
    }
    res.redirect('/login');
});


module.exports = router;
