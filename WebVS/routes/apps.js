var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;

router.get('/', function (req, res) {
	if (req.user) {
		Application.find({}, function (err, app_list) {
			res.render('apps', { title: 'Личный кабинет', List: app_list });
		});
	} else {
		res.redirect('/auth');
	}
});



module.exports = router;