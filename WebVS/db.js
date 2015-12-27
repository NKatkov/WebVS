﻿var mongoose = require('mongoose'),
    crypto = require('crypto'),
    async = require('async'),
    Schema = mongoose.Schema,
    util = require("util");

mongoose.connect('mongodb://nhost.cloudapp.net:27017/WebVS');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Successfully connected!');
});

var UserSchema = new Schema({
    username: { type: String, index: { unique: true }, required: true },
    hashedPassword: { type: String, required: true },
    salt: { type: String, required: true },
    created: {type: Date, default: Date.now}
});

UserSchema.method({
    encryptPassword: function (password){
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    },
    checkPassword: function (password){
        return this.encryptPassword(password) === this.hashedPassword;
    }
})

UserSchema.virtual('password')
    .set(function (password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
})
    .get(function () {
    return this._plainPassword;
});


UserSchema.statics.authorize = function (username, password, callback) {
    var User = this;
    
    async.waterfall([
        function (callback) {
            User.findOne({ username: username }, callback);
        },
        function (User, callback) {
            if (User) {
                if (User.checkPassword(password)) {
                    callback(null, User);
                } else {
                    console.log("Пароль неверен")
                    //callback(new AuthError("Пароль неверен"));
                }
            }
        }
    ], callback);
};

function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);
    this.message = message;
}

//util.inherits(AuthError, Error);
//AuthError.prototype.name = 'AuthError';
//exports.AuthError = AuthError;

module.exports.db = db;
module.exports.User = mongoose.model("User", UserSchema);
