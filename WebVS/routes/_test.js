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
        res.render('index', { title: 'Личный кабинет', User: req.user });
    } else {
        res.redirect('/auth');
    }
});

router.get('/ajax/info', function (req, res) {
    if (req.user) {
        getInfo(null, function (err, str) {
            res.json(str);
        })
    }
});

router.get('/test', function (req, res, next) {
    if (req.user) {
        var newApp = new db.Application({
            AppName: 'Test',
            UserOwner: 'admin',
            IP: '127.0.0.1',
            Path: './users/xklx/',
            StartupFile: 'app.js'
        })
			/*
            newApp.save({}, function (err) {
                console.log('Error: ' + err)
                res.render('index', { title: 'Личный кабинет', status: newApp });
            });
			*/
        
        var spawn = require('child_process').spawn,
			child = spawn('node', ['./users/xklx/app.js']);

            console.log(child.pid);
            child.stdout.on('data', function (data) {
            res.render('index', { title: 'Личный кабинет', status: data });
        });
         
    }
});

router.get('/ajax/info2', function (req, res) {
    if (req.user) {
        var exec = require('child_process').exec,
            converter = new Converter({}),
            child = exec('chcp 65001 | systeminfo /FO CSV"', function (error, stdout, stderr) {
                converter.fromString(stdout, function (err, result) {
                    res.json(result);
                });
            });
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
                        Drives.push({
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

function getOS2(result, onComplete) {
    var err;
    var converter = new Converter({})
    var child = exec('uname -n -s -r -i', function (error, stdout, stderr) {
        var str = stdout.split(' ')
        result = { Name : str[1], OS: str[0], verOS: str[3], verKernel: str[2] };
        onComplete(err, result);
    });
}

function getRam(params, onComplete) {
    //var result = { use: 54654, full: 999999, free: 38415 }
    //onComplete(err, result);
}



module.exports = router;