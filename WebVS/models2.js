﻿var mongoose = require('mongoose'),
    crypto = require('crypto');

mongoose.model('User', {
    properties: ['username', 'hashed_password', 'salt', 'role'],
    
    indexes: [
        [{ name: 1 }, { unique: true }]
    ],
    
    getters: {
        id: function () { return this._id.toHexString();},
        password: function () { return this._password; },
        role: function () { return this.role; }
    },
    
    setters: {
        password: function (password) {
            this._password = password;
            this.salt = this.makeSalt();
            this.hashed_password = this.encPass(password);
        }
    },
    
    methods: {
        authenticate: function (plainText) {
            return this.encPass(plainText) === this.hashed_password;
        },

        makeSalt: function () {
            return Math.round((new Date().valueOf() * Math.random())) + '';
        },
        
        encPass: function (password) {
            return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
        },
        
        isValid: function () {
            // TODO: Better validation
            return this.name && this.name.length > 0 && this.name.length < 255 
             && this.password && this.password.length > 0 && this.password.length < 255;
        },

        save: function (okFn, failedFn) {
            if (this.isValid()) {
                this.__super__(okFn);
            } else {
                failedFn();
            }
        }
    }
});

mongoose.model('Application', {
    properties: ['AppName', '_salt'],
    
    indexes: [
        [{ Port: 9000 }, { unique: true }]
    ],
    
    setters: { },
    getters: { },
    methods: { }
});

exports.Application = function (db) {
    return db.model('Application');
};

exports.User = function (db) {
    return db.model('User');
};