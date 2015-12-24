var express = require('express');
var router = express.Router();


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
    if (req.body.login && req.body.pass) {
        if (req.body.login == 'admin' && req.body.pass == '1') {
            req.session.user = req.body.login
            res.redirect('/');
            return;
        }
    }
    res.redirect('/login');
});


module.exports = router;