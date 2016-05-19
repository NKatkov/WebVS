var mongoose = require('mongoose'),
    crypto = require('crypto'),
    async = require('async'),
    Schema = mongoose.Schema,
    util = require("util");
var net = require('net');
var running = require('is-running')
var spawn = require('child_process').spawn
var conn = mongoose.connect('mongodb://dbAdmin:RemW26mt@nhost.cloudapp.net:27017/WebVS');
var db = mongoose.connection;
db.on('error', function (error) {
    console.error.bind(console, 'connection error:');
    var conn = mongoose.connect('mongodb://dbAdmin:RemW26mt@127.0.0.1:27017/WebVS');
});
//
db.once('open', function callback() {
    console.log('Successfully connected!');
});

var UserSchema = new Schema({
    username: { type: String, index: { unique: true }, required: true },
    hashedPassword: { type: String, required: true },
    salt: { type: String, required: true },
    created: { type: Date, default: Date.now },
    role: { type: String, required: true , default: "user" }
});

UserSchema.method({
    encryptPassword: function (password) {
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    },
    checkPassword: function (password) {
        return this.encryptPassword(password) === this.hashedPassword;
    },
    IsAdmin: function () {
        if (this.role == "admin") {
            return true
        }
        return false;
    }
})

UserSchema.virtual('password')
    .set(function (password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
})
    .get(function () { return this._plainPassword; });

UserSchema.statics = {
    authorize: function (username, password, callback) {
        var User = this;
        async.waterfall([
            function (callback) {
                User.findOne({ username: username }, callback);
            },
            function (aUser, callback) {
                if (aUser) {
                    if (aUser.checkPassword(password)) {
                        callback(null, aUser);
                    } else {
                        callback("Логин или пароль указаны не верно!", aUser);
                    }
                } else {
                    callback("Логин или пароль указаны не верно!", aUser);
                }
				
            }
        ], callback);
    }
}




var AppSchema = new Schema({
    AppName: { type: String, required: true },
    UserOwner: { type: String, required: true },
    IP: { type: String, required: true },
    Port: { type: Number, index: { unique: true } },
    PID: { type: Number },
    Enable: { type: Boolean , required: true , default: false },
    Status: {
        type: String, default: "Offline", required: true, 
        get: function () {
            if (this.Enable) {
                if (running(this.PID)) {
                    return "Online"
                } else {
                    return "Offline"
                }
            } else {
                return "Отключен"
            }
        }
    },
    Path: {	type: String, required: true},
    StartupFile: { type: String, required: true },
	Package:{
		name: {type: String  },
		version: {type: String  },
		private: {type: Boolean  },
		scripts: {type: Array  },
		description: {type: String  },
		author: {type: Array  },
		repository: {type: Array  },
		engines: {type: Array  },
		dependencies: {type: Array  },
		devDependencies: {type: Array  },
		keywords: {type: Array  },
	}

	/*Package: {
		type: String,
		get: function(data) {
			try { 
				return JSON.parse(data);
			} catch(err) { 
				return data;
			}
		},
		set: function(data) {
			return JSON.parse(data);
		}
	}*/
});

AppSchema.method({
    Start: function () {
		var fs = require('fs');
		var spawn = require('child_process').spawn
		var exec = require('child_process').exec
		child2 = spawn('sudo', ["-u",this.UserOwner,this.Path + "touch",'logFile.log'],{detached: true})
		var att = this.StartupFile.split(" ")
		//stdio: ['pipe', 1, 2, 'ipc']
		child = spawn('sudo', ['-u', this.UserOwner, "PORT=" + this.Port,att[0],att[1],att[2],att[3],att[4]],{detached: true, cwd : this.Path})
		logStream = fs.createWriteStream(this.Path + 'logFile.log', { flags: 'a', encoding: 'UTF-8'});

        child.stdout.pipe(logStream);
        child.stderr.pipe(logStream);
        child.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
        
        this.PID = child.pid
        this.save({}, function (err) {
            if (!err) {
				//child.unref();
                console.log('Error: ' + err)
            }
        })
        return this.PID
    },
	Stop: function () {
			child = spawn("sudo", [ "kill" , "15", -this.PID])
			return true
	},
	
	
    checkPassword: function (password) {
        return this.encryptPassword(password) === this.hashedPassword;
    },
    IsAdmin: function () {
        if (this.role == "admin") {
            return true
        }
        return false;
    }
})

var PortSchema = new Schema({
    Port: { type: Number, required: true },
    Created: { type: Date, default: Date.now }
});

var DBSchema = new Schema({
    NameDB: { type: String, required: true },
    User: { type: String, required: true },
    Logins: {type: Array, required: false },
    Created: { type: Date, default: Date.now }
});


module.exports.conn = conn;
module.exports.db = db;
module.exports.dbs = mongoose.model("DBs", DBSchema);
module.exports.Ports = mongoose.model("Ports", PortSchema);
module.exports.User = mongoose.model("User", UserSchema);
module.exports.Application = mongoose.model("Application", AppSchema);