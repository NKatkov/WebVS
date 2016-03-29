var express = require('express');
var router = express.Router();
var User = require('../db').User;
var db = require('../db').db;

router.get('/', function (req, res) {
	if (req.user) {
		if (req.user.IsAdmin()) {
			User.find({}, function (err, users) {
				if (err) throw err;
				res.render('users', { title: 'Управление пользователями', list_user: users });
			});
		} else {
			res.render('index', { title: 'Личный кабинет', User: req.user, status: 'Нету доступа к "Управление пользователями"' })
		}
	} else {
		res.redirect('/auth')
	}
});

router.get('/create', function (req, res) {
	if (req.user && req.user.IsAdmin()) {
		res.render('users', { title: 'Создание пользователя', User: req.user, menu: 'user_create' });
	} else {
		res.redirect('/auth');
	}
});

router.get('/:id/edit', function (req, res) {
	if (req.user) {
		User.findOne({ _id: req.params.id }, function (err, eUser) {
			res.render('user_edit', { title: 'Личный кабинет', user: eUser });
		});
				
		
	} else {
		res.redirect('/auth');
	}
});



router.get('/edit', function (req, res) {
	if (req.user && req.user.IsAdmin()) {
		console.log(req.param);
		User.find({}, function (err, users) {
			if (err) throw err;
			res.render('users', { title: 'Изменение пользователя', list_user: users });
		});

	} else {
		res.redirect('/auth');
	}
});

router.get('/editperm', function (req, res) {
	if (req.user && req.user.IsAdmin()) {
		User.find({}, function (err, users) {
			if (err) throw err;
			res.render('users', { title: 'Управление правами пользователями', list_user: users, menu: 'user_edit_role' });
		});
	} else {
		res.redirect('/auth');
	}
});

router.get('/delete', function (req, res) {
	if (req.user && req.user.IsAdmin()) {
		User.find({}, function (err, users) {
			if (err) throw err;
			res.render('users', { title: 'Удаление пользователя', list_user: users, menu: 'user_delete' });
		});
	} else {
		res.redirect('/auth');
	}
});

router.post('/:id/edit', function (req, res) {
	console.log(req.body)
	
	if (req.user && req.user.IsAdmin()) {
		User.findOne({ username: req.param.id }, function (err, mUser) {
			if (!err) {
				if (req.body.pass) { mUser.password = req.body.pass }
				if (req.body.role) { mUser.role = req.body.role }
				mUser.save()
				User.find({}, function (err, users) {
					if (err) throw err;
					res.render('users', { title: 'Управление правами пользователями', list_user: users, menu: 'users' , status: 'Пользователь успешно изменен' });
				});
			}
		});
	}
});

router.post('/editperm', function (req, res) {
	if (req.user && req.user.IsAdmin()) {
		User.findOne({ username: req.body.nick }, function (err, mUser) {
			if (!err) {
				mUser.role = req.body.role;
				mUser.save();
				res.render('users', { title: 'Управление правами пользователями', menu: 'users' , status: 'Пользователь успешно изменен' });
			}
		});
	}
});

router.post('/delete', function (req, res) {
	if (req.user && req.user.IsAdmin()) {
		User.findOneAndRemove({ username: req.body.username }, function (err, user_del) {
			if (err) throw err;
			if (user_del != null) {
				db.collection('sessions').remove({ session: new RegExp('' + user_del._id + '', 'i') }, function (err, ress) {
					if (err) throw err;
					if (ress.result.ok == 1 && ress.result.n >= 0) {
						if (user_del.username == req.body.username) { req.session = null }
						User.find({}, function (err, user_list) {
							if (err) throw err;
							res.render('users', { title: 'Управление пользователями', list_user: user_list, status: "Пользователь с логином " + req.body.username + " успешно удален" });
						});
					}
				});
			} else {
				User.find({}, function (err, user_list) {
					if (err) throw err;
					res.render('users', { title: 'Удаление пользователя', list_user: user_list, status: "Произошла ошибка при удалении пользователя: " + req.body.username + " , пользователь не найден", menu: 'user_delete' });
				});
			}
		});
	} else {
		res.redirect('/auth');
	}
});

module.exports = router;