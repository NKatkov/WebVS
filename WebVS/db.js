var mongoose = require('mongoose'),
    crypto = require('crypto'),
    async = require('async'),
    Schema = mongoose.Schema,
    util = require("util");
var net = require('net');

var conn = mongoose.connect('mongodb://nhost.cloudapp.net:27017/WebVS');
var db = mongoose.connection;
db.on('error', function (error) {
    console.error.bind(console, 'connection error:');
    mongoose.connect('mongodb://127.0.0.1:27017/WebVS');
});

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
    Status: {
        type: String, default: "Offline2", required: true, 
        get: function () {

            console.log('Error: ' + this.Port);
            var client = net.connect({ port: this.Port }, function () {
                console.log('client');
            })
            .on('error', function (){
                console.log('error');
                
            })
            .on('data', function () {
                console.log('data');           
            })
            .on('connect', function () {
                console.log('connect');           
            });
            console.log(client.on('error', function () { }));
            return client.res;
        }
    },
    Path: { type: String, required: true },
    StartupFile: { type: String, required: true },
});

var PortSchema = new Schema({
	Port: { type: Number, required: true},
	Created: { type: Date, default: Date.now }
});

module.exports.conn = conn;
module.exports.db = db;
module.exports.Ports = mongoose.model("Ports", PortSchema);
module.exports.User = mongoose.model("User", UserSchema);
module.exports.Application = mongoose.model("Application", AppSchema);