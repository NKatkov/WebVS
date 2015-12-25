var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema( {
    nick: { type: String, default: "hahaha" },
    pass: { type: String, match: /[a-z]/ },
    date: { type: Date },
    buff: Buffer
} );

var User = dbConnection.model("User",UserSchema)

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
          var newUser = new User({ name: "Alice", pass: "qwe"})
	  		newUser.save(function (err, newUser) {
			if (err){
				console.log("Something goes wrong with user " + newUser.name);
			}else{
				newUser.speak();
			}
		});  
	 //dbConnection
           // console.log(dbConnection.db.sessions.find());
            req.session.user = req.body.login
            res.redirect('/');
            return;
        }
    }
    res.redirect('/login');
});


function hashPWD(pwd) {
    return pwdMD5 = crypto.createHash('md5')
  .update(pwd)
  .digest('hex');
}

module.exports = router;
