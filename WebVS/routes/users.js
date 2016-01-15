var express = require('express');
var router = express.Router();
var User = require('../db').User;
var db = require('../db');

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
        res.render('user_menu_create', { title: 'Создание пользователя', User: sess.user });
    } else {
        res.redirect('/auth');
    }
});

router.get('/edit', function (req, res) {
    var sess = req.session
    if (sess.user) {
        User.find({}, function (err, users) {
            if (err) throw err;
            res.render('user_menu_edit', { title: 'Изменение пользователя', list_user: users });
        });

    } else {
        res.redirect('/auth');
    }
});

router.get('/editperm', function (req, res) {
    var sess = req.session
    if (sess.user) {
        User.find({}, function (err, users) {
            if (err) throw err;
            res.render('user_menu_edit_perm', { title: 'Управление правами пользователями', list_user: users });
        });
    } else {
        res.redirect('/auth');
    }
});


router.get('/delete', function (req, res) {
    var sess = req.session
    if (sess.user) {
        User.find({}, function (err, users) {
            if (err) throw err;
            res.render('user_menu_delete', { title: 'Удаление пользователя', list_user: users });
        });
    } else {
        res.redirect('/auth');
    }
});

router.post('/delete', function (req, res) {
    var sess = req.session
    if (sess.user) {
        console.log(req.body.username)
        
        User.findOneAndRemove({ username: req.body.username }, function (err, user_del) {
            if (err) throw err;
           
            User.find({}, function (err, user_list) {
                if (err) throw err;
                res.render('user_menu_delete', { title: 'Удаление пользователя', list_user: user_list, status: "Пользователь с логином " + req.body.username + " успешно удален" });
            });

            
        });
        
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



