var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function (req, res) {
    var sess = req.session
    if (sess.user) {
        res.render('index', { title: 'Express' });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;