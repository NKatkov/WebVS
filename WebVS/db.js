var mongoose = require('mongoose'),
    crypto = require('crypto'),
    async = require('async'),
    Schema = mongoose.Schema,
    MongoStore = require('connect-mongo');

mongoose.connect('mongodb://nhost.cloudapp.net:27017/WebVS');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Successfully connected!');
});

var UserSchema = new Schema({
    username: { type: String, index: { unique: true }, required: true },
    hashedPassword: { type: String, required: true },
    salt: { type: String, required: true }
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


module.exports.user = mongoose.model("User", UserSchema);
module.exports.db = db;