var express = require('express');
var router = express.Router();
var iconv = require('iconv-lite');
var Converter = require("csvtojson").Converter;
var util = require('util');
var exec = require('child_process').exec;
var si = require('systeminformation');
var async = require('async');
var io_client = require('socket.io-client');
var db = require('../db');




router.get('/', function (req, res) {
    if (req.user) {
        getInfo(null, function (err, str) {
            res.render('dashboard',str);
        })
    }
});





function getInfo(result, onComplete) {
    var err;
    var os = require('os');
    var d = require('diskinfo');
    var tasksIndex = {
        OS: function (callback) {
            OS = {
                Name : os.hostname(), 
                OS: os.platform(),
                VerOS: os.arch(),
                VerKernel: os.release(),
                CPU: os.cpus()[0].model,
                CPUcout: os.cpus().length,
                RAM: Math.round(os.totalmem() / 1024 / 1024),
                FreeRAM: Math.round(os.freemem() / 1024 / 1024)
            };
            callback(err, OS)
        },   
        Drives: function (callback) {
            d.getDrives(function (err, aDrives) {
                var num = -1
                var Drives = [];
                for (var i = 0; i < aDrives.length; i++) {
                    if (aDrives[i].used != 0) {
                        Drives.push( {
                            Drive: aDrives[i].filesystem,
                            mounted: aDrives[i].mounted,
                            blocks : aDrives[i].blocks,
                            used: aDrives[i].used,
                            available: aDrives[i].available,
                            capacity: aDrives[i].capacity,
                        });
                    }
                }
                callback(err, Drives);
            })
        },
        NetworkInterfaces: function (callback) {
            callback(err, os.networkInterfaces());
        }
    };
    async.parallel(tasksIndex, function (err, result) {
        onComplete(err, result);
    });
}


module.exports = router;