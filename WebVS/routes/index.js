var express = require('express');

var db = require('../db');

module.exports = function (app) {
	app.all('*',function (req, res, next) {
		if (req.session.user) {
			db.User.findById(req.session.user._id, function (err, user) {
				if (user) {
					req.session.user = req.user = user || false;
					next();
				}
			});
		} else {
			next();
		}
	});

	app.all('*',function (req, res, next) {
		req.remoteIP = Acf.remoteIP(req);
		next();
	});

	app.all('*',function (req, res, next) {
		res.locals = {
			app: {
				user: req.user || false,
				Acf: Acf
			}
		};
		next();
	});

	app.use('/auth', require('./auth'));
	
	app.all('*', function (req, res, next) {
		if (!req.user) {
			res.redirect('/auth'); 
			return;			
		}
		next();
	});
	
	
	
	app.use('/', require('./home'));
	//require('./home')(app);
	
	app.use('/_test', require('./_test'));
	app.use('/dashboard', require('./dashboard'));
	
	
	app.use('/app', require('./apps'));
	app.use('/man/srv', require('./srv'));
	app.use('/man/users', require('./users'));
	app.use('/man/package', require('./package'));


	// ��������� ������
	app.use(function (req, res, next) {
		var err = new Error('Not found...');
		err.status = 404;
		next(err);
	});

	if (app.get('env') === 'development') {
		app.use(function (err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: err
			});
		});
	}

	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});
	
};