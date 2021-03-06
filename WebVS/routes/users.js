﻿var express = require('express');
var router = express.Router();
var User = require('../db').User;
var Application = require('../db').Application;
var db = require('../db').db;
var exec = require('child_process').exec

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
		res.render('user_create');
	} else {
		res.redirect('/auth');
	}
});

router.post('/create', function (req, res, next) {
	if (req.user && req.user.IsAdmin()) {
		if (req.body.login && req.body.pass) {
			var newUser = new User({ username: req.body.login, password: req.body.pass, role: req.body.role })
			newUser.save(function (err) {
				if (!err) {
					exec("sudo useradd " + req.body.login + " -c"  + newUser.username + " -g WebApi -m -p " + req.body.pass,function(error, stdout, stderr){
						if(!error){
							exec("sudo -u " + newUser.username + " sh -c 'echo cache=/home/" + newUser.username + "/.npm >> /home/" + newUser.username + "/.npmrc && echo userconfig=/home/" + newUser.username + "/.npmrc >> /home/" + newUser.username + "/.npmrc'",function(error, stdout, stderr){
								if (req.session.user && !error) {
									res.render('user_create', { title: 'Управление пользователями', status: "Пользователь " + req.body.login + " успешно создан" });
								} else {
									console.log(error)
									res.render('user_create', { title: 'Управление пользователями', error: "Error: create .npmrc" });
								}
							})
						} else {
							res.render('user_create', { title: 'Управление пользователями', error: "Error: useradd" });
						}
					})
				} else {
					res.render('user_create', { title: 'Управление пользователями', error: "Error:reg(newUser.save)" });
				}
			});
			return
		}
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

router.post('/:id/edit', function (req, res) {
    if (req.user && req.user.IsAdmin()) {
        User.findOne({ _id: req.params.id }, function (err, mUser) {
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

router.get('/:id/delete', function (req, res) {
	if (req.user && req.user.IsAdmin()) {
		User.findOneAndRemove({ _id: req.params.id }, function (err, user_del) {
			if (err) throw err;
			if (user_del != null) {
				db.collection('sessions').remove({ session: new RegExp('' + user_del._id + '', 'i') }, function (err, ress) {
					if (err) throw err;
					if (ress.result.ok == 1 && ress.result.n >= 0) {
						if (user_del.username == req.user.username) { req.session = null }
						User.find({}, function (err, user_list) {
							if (err) throw err;	
							res.render('users', { title: 'Управление пользователями', list_user: user_list, status: "Пользователь с логином " + user_del.username + " успешно удален" });
						});
					}
				});
				Application.find({UserOwner:user_del.username}, function (err, app) {
					if (err) throw err;
					if (!err && app) {
						for (i = 0; i < app.length; i++) {
							if (app[i].Stop()) {
								app[i].remove({},function(error){
									console.log(error);
								})
								console.log("App Stop(): Port " + app[i].Port + " PID:" + app[i].PID)
							}
						}
					}
				})
				var spawn = require('child_process').spawn,
				child = spawn('sudo', ["mv", "/home/" + user_del.username, "/home/archived_users/" + user_del.username + "_" + user_del._id])
				child2 = spawn('sudo', ["deluser", user_del.username])
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