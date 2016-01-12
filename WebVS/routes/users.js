var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
    var sess = req.session
    if (sess.user) {
        res.render('users', { title: 'Управление пользователями', User: sess.user });
    } else {
        res.redirect('/auth');
    }
});

module.exports = router;



