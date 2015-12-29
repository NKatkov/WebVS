var express = require('express');
var router = express.Router();
var iconv = require('iconv-lite');
var Converter = require("csvtojson").Converter;
var util = require('util');


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
    var exec = require('child_process').exec,
        converter = new Converter({}),
        child = exec('chcp 65001 | systeminfo /FO CSV"', function (error, stdout, stderr) {
            converter.fromString(stdout, function (err, result) {
                
                res.json(result);
            //console.log(result[5])
            });
        });
});

function getRam(params, onComplete) {
    //var result = { use: 54654, full: 999999, free: 38415 }
    //onComplete(err, result);
}



module.exports = router;