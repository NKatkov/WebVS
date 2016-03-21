var express = require('express');
var router = express.Router();
var User = require('../db').User;

router.get('/', function (req, res) {
    if (req.user) {
        res.render('apps', { title: 'Личный кабинет', User: req.user });
    } else {
        res.redirect('/auth');
    }
});






module.exports = router;