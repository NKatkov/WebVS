var db = require('mongodb').db,
    Server = require('mongodb').Server,
	express = require('express'),
	router = express.Router(),
    assert = require('assert');
var User = require('../db').User;
var DBs = require('../db').dbs;
var async = require('async');
var MongoClient = require('mongodb').MongoClient
  
router.get('/', function (req, res, next) {
	DBs.find({'User' : req.user.username}, function(err,list){
		res.render('DBs', {'list': list, 'error':err});
	})


	//var url = 'mongodb://Carlos21:password@localhost:27017/tes1';
	//var url = 'mongodb://dbAdds:Fn50roang37@localhost:27017/tes1?authMechanism=MONGODB-CR&authSource=admin';
	//MongoClient.connect(url, function(err, db) {
	//	console.log(err)
	//	console.log(db)

		
		//db.collection('index').insert({'aa':'asda'},function(err,res){
		//	console.log(err)
		//	console.log(res)
		//	
		//})
		
		//db.collection('test').insert({'aa':'asda'},function(err,res){
		//	console.log(err)
		//	console.log(res)
		//	
		//})
	//})
})

router.get('/add', function (req, res, next) {
	res.render('DBs_create', {'list': {}});
})

router.post('/add', function (req, res, next) {
	var url = 'mongodb://dbAdds:Fn50roang37@localhost:27017/' + req.user.username + "_" + req.body.db_name + '?authMechanism=MONGODB-CR&authSource=admin'
	MongoClient.connect(url, function(err, db) {
		if(!err && db){
			db.addUser(req.body.login,req.body.pass,{'roles': [{'role':req.body.role,'db': req.user.username + "_" + req.body.db_name}]}, function(err,result){
				console.log(err)
				var NewDB = new DBs({ 'User': req.user.username, 'NameDB':  req.user.username + "_" + req.body.db_name, Logins: [[req.body.login,req.body.role]]})
				NewDB.save(function (err) {
					if(!err){
						DBs.find({'User' : req.user.username}, function(err,list){							
							res.render('DBs', {'list': list, 'error':err});
						})
					}
				})
	
				console.log(err)
				console.log(result)
			})
		}
		
		
	})

	
})

router.get('/:id/delete', function (req, res) {
	DBs.find({ '_id': req.params.id }, function(err,lDb){	
		console.log(lDb)
		var url = 'mongodb://dbAdds:Fn50roang37@localhost:27017/' + lDb[0].NameDB + '?authMechanism=MONGODB-CR&authSource=admin'
		MongoClient.connect(url, function(err, db) {
			console.log(err)
			async.waterfall([
				function(callback){
					db.addUser('dbDelete','Fn50roan5925',{'roles': [{'role':"dbOwner",'db': lDb[0].NameDB}]}, function(err,result){
						if(!err || err.code == 11000){
							callback(null, true);
						}else{
							callback("131", false);
						}
					})
					
				},
				function(arg1, callback){
					db.authenticate('dbDelete','Fn50roan5925', function(err, result) {
						console.log(err)
						db.dropDatabase(function(err, result) {
							console.log(err)
							if(!err){
								callback(null, true);
							}else{
								callback("231", false);
							}
						})
					})

				},
				function(arg1, callback){
					for(i = 0;i<lDb[0].Logins.length;i++){
						db.removeUser(lDb[0].Logins[0][i], function(err, result) {
							console.log(err)
							if(!err){
								callback(null, true);
							}else{
								callback("321", false);
							}
						})
					}
				},
				function(arg1, callback){
					db.removeUser('dbDelete', function(err, result) {
						if(!err){
							callback(null, true);
						}else{
							callback("421", false);
						}
						
					})
				},
				function(arg1, callback){
					DBs.findOneAndRemove({ _id: req.params.id }, function (err, db_del) {
						if(!err){
							callback(null, true);
						}else{
							callback("551", false);
						}
					})
				}], function (err, result) {
					console.log(result)
					if(result){
						DBs.find({'User' : req.user.username}, function(err,list){							
							res.render('DBs', {'list': list, 'error':err});
						})
					}else{res.render('DBs',{'list': [], error : "При удалении базы возникла ошибка " + err });}
				}
			);	
		})
	})
})

router.post('/:id/remove', function (req, res) {
	DBs.find({ '_id': req.params.id }, function(err,lDb){
		for(i=0;i<lDb[0].Logins.length;i++){
			//console.log("lDb[0] = " + lDb[0])
			//console.log("lDb[0].Logins[i][0] = " + lDb[0].Logins[i][0])
			//console.log("req.body.login = " + req.body.login)
			if(lDb[0].Logins[i][0] == req.body.login){
				var url = 'mongodb://dbAdds:Fn50roang37@localhost:27017/' + lDb[0].NameDB + '?authMechanism=MONGODB-CR&authSource=admin'
				MongoClient.connect(url, function(err, db) {
					//console.log(err)
					//console.log(lDb[0].Logins[i][0])
					db.removeUser(lDb[0].Logins[i][0], function(err, result) {
						//console.log(err)
						lDb[0].Logins.splice(i, 1);
						lDb[0].save({},function(err,result){
							if(!err){
								res.render('DBs_edit',{'list': lDb, 'title' : "Настройка доступа к базе " + lDb[0].NameDB});
							}else{
								res.render('DBs_edit',{'list': lDb, 'title' : "Настройка доступа к базе " + lDb[0].NameDB,'error':err});
							}
						})
						//res.render('DBs_edit',{'list': lDb, 'title' : "Настройка доступа к базе " + lDb[0].NameDB});
						
					})
				})
				break;
			}
		}
	})
	
})
	
router.post('/:id/edit', function (req, res) {
	DBs.find({ '_id': req.params.id }, function(err,lDb){
		console.log(lDb[0])
		var url = 'mongodb://dbAdds:Fn50roang37@localhost:27017/' + lDb[0].NameDB + '?authMechanism=MONGODB-CR&authSource=admin'
		MongoClient.connect(url, function(err, db) {
			//console.dir(db)
			if(req.body.login){
				
				db.addUser(req.body.login,req.body.pass,{'roles': [{'role':req.body.role,'db': lDb[0].NameDB}]}, function(err,result){
					console.log(err)
					console.log(result)
					lDb[0].Logins.push([req.body.login,req.body.role])
					lDb[0].save({},function(err,result){
						if(!err){
							res.render('DBs_edit',{'list': lDb, 'title' : "Настройка доступа к базе " + lDb[0].NameDB});
						}else{
							res.render('DBs_edit',{'list': lDb, 'title' : "Настройка доступа к базе " + lDb[0].NameDB,'error':err});
						}
					})
				})
				
			
			}else{
				if(req.body.pass){
					db.command( {"updateUser": req.body.l5 , "pwd": req.body.pass }, function(err,result){
						//console.log(err)
						if(!err){
							res.render('DBs_edit',{'list': lDb, 'title' : "Настройка доступа к базе " + lDb[0].NameDB,status:"Данные успешно обновлены"});
						}
					})
				}
				if(req.body.role){
					db.command( {"updateUser": req.body.l5 , "roles":[{"role":req.body.role,"db":lDb[0].NameDB}] }, function(err,result){
						//console.log(err)
						if(!err){
							for(i=0;i<lDb[0].Logins.length;i++){
								if(lDb[0].Logins[i][0] == req.body.l5){
									lDb[0].Logins.splice(i, 1);
									lDb[0].Logins.push([req.body.l5,req.body.role])
									lDb[0].save({},function(err,result){
										if(!err){
											res.render('DBs_edit',{'list': lDb, 'title' : "Настройка доступа к базе " + lDb[0].NameDB,status:"Данные успешно обновлены"});
										}
									})
								}
							}
						}
					})
				}
			}
		})
	})
	
})

router.get('/:id/edit', function (req, res) {
		DBs.find({ '_id': req.params.id }, function(err,lDb){
			console.log(lDb)
			res.render('DBs_edit',{'list': lDb, 'title' : "Настройка доступа к базе " + lDb[0].NameDB});
		})
	
	
	
})

module.exports = router;