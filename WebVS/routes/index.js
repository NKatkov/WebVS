var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    console.log(req.session.user)
    var sess = req.session
    if (sess.user) {
        res.render('index', { title: 'Главная страница ', User: sess.user });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;