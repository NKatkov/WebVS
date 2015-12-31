var express = require('express');
var router = express.Router();
var iconv = require('iconv-lite');
var Converter = require("csvtojson").Converter;
var util = require('util');
var exec = require('child_process').exec;
var si = require('systeminformation');
var async = require('async');


/* GET home page. */
router.get('/', function (req, res) {
    var sess = req.session
    if (sess.user) {
        res.render('index', { title: 'Главная страница ', User: sess.user });
    } else {
        //res.redirect('/ajax/info');
        res.redirect('/login');
    }
});

router.get('/man/srv', function (req, res) {
    var sess = req.session
    if (sess.user) {
        res.render('srv', { title: 'Управление сервером ', User: sess.user });
    } else {
        //res.redirect('/ajax/info');
        res.redirect('/login');
    }
});

router.get('/ajax/info', function (req, res) {
    getInfo(null, function (err, str) {
        res.json(str);
    })
});

router.get('/ajax/info2', function (req, res) {
    var exec = require('child_process').exec,
        converter = new Converter({}),
        child = exec('chcp 65001 | systeminfo /FO CSV"', function (error, stdout, stderr) {
            converter.fromString(stdout, function (err, result) {
                res.json(result);
            //console.log(result[5])
            });
        });
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
                var Drives = {};
                for (var i = 0; i < aDrives.length; i++) {
                    if (aDrives[i].used != 0) {
                        num += 1
                        Drives.count = num + 1;
                        Drives["disk" + num] = {
                            Drive: aDrives[i].filesystem,
                            mounted: aDrives[i].mounted,
                            blocks : aDrives[i].blocks,
                            used: aDrives[i].used,
                            available: aDrives[i].available,
                            capacity: aDrives[i].capacity,
                        }
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

function getCPU(result, onComplete) {
    var err;
    var converter = new Converter({})
    var child = exec(' cat /proc/cpuinfo | grep -e "cpu " -e "model name"', function (error, stdout, stderr) {
        
        var str = stdout.split('\n')
        console.log(stdout);
        var result2 = stdout.match(/\: .*/ig);
        console.log(result2);
        
        
        result.Namew = str[1];
        result.OSw = str[0];
        result.verOSw = str[3];
        result.verKernel = str[2];
        onComplete(err, result);
    });
}



function getRam(params, onComplete) {
    //var result = { use: 54654, full: 999999, free: 38415 }
    //onComplete(err, result);
}



module.exports = router;