var express = require('express');
var router = express.Router();
var iconv = require('iconv-lite');
var Converter = require("csvtojson").Converter;
var util = require('util');
var exec = require('child_process').exec;
var si = require('systeminformation');


/* GET home page. */
router.get('/', function (req, res) {
    var sess = req.session
    if (sess.user) {
        res.render('index', { title: 'Главная страница ', User: sess.user });
    } else {
        res.redirect('/login');
    }
});

router.get('/ajax/info', function (req, res) {
    var Info;
    getInfo(Info, function (err, str) {
        res.json(str);
    })
	
});

router.get('/ajax/info3', function (req, res) {
	var Info;
	getOS(Info,function(err,str){
		getCPU(str,function(err,str){
			res.json(str);
		})
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
    result = {
        Name : os.hostname(), 
        OS: os.platform(),
        VerOS: os.arch(),
        VerKernel: os.release(),
        CPUcout: os.cpus().length,
        RAM: Math.round(os.totalmem() / 1024 / 1024),
        FreeRAM: Math.round(os.freemem() / 1024 / 1024)
    };
    d.getDrives(function (err, aDrives) {
        for (var i = 0; i < aDrives.length; i++) {
            console.log('Drive ' + aDrives[i].filesystem);
            console.log('blocks ' + aDrives[i].blocks);
            console.log('used ' + aDrives[i].used);
            console.log('available ' + aDrives[i].available);
            console.log('capacity ' + aDrives[i].capacity);
            console.log('mounted ' + aDrives[i].mounted);
            console.log('-----------------------------------------');
        }
    })

    onComplete(err, result);
}

function getOS2(result, onComplete) {
	var err;
	var converter = new Converter({})
    var child = exec('uname -n -s -r -i', function (error, stdout, stderr) {
		var str = stdout.split(' ')
		result = {Name : str[1], OS: str[0],verOS: str[3], verKernel: str[2]};
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