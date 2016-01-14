var express = require('express');
var router = express.Router();
var db = require('../db').db;
var User = require('../db').User;
/* GET users listing. */
router.get('/', function (req, res) {
    var sess = req.session
    if (sess.user) {
        res.render('users', { title: 'Управление пользователями', User: sess.user });
    } else {
        res.redirect('/auth');
    }
});

router.get('/create', function (req, res) {
    var sess = req.session
    if (sess.user) {
        res.render('user_menu_create', { title: 'Управление пользователями', User: sess.user });
    } else {
        res.redirect('/auth');
    }
});

router.get('/edit', function (req, res) {
    var sess = req.session
    if (sess.user) {
        var newUser = new User({ username: "" })
        console.log(newUser.)
        //console.log(User.users.find({},"username"))
        //res.send(User.find('username'))

        //res.render('users', { title: 'Управление пользователями', User: sess.user });
    } else {
        res.redirect('/auth');
    }
});

router.get('/', function (req, res) {
    var sess = req.session
    if (sess.user) {
        res.render('users', { title: 'Управление пользователями', User: sess.user });
    } else {
        res.redirect('/auth');
    }
});
module.exports = router;



