var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    util = require('util'),
    MongoStore = require('connect-mongo')(session),
    db = require('./db'),
    app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));



app.use(express.static(path.join(__dirname, 'public'))).listen(8080);

app.use(session({
    secret: 'sdfasdfasdfas',
    store: new MongoStore({ mongooseConnection: db.db }),
    saveUninitialized: true,
}));

db.Application.find({Enable:true}, function (err, app) {
    if (!err && app) {
        for (i = 0; i < app.length; i++) {
            if (app[i].Start()) {
                console.log("App Start(): Port " + app[i].Port + " PID:" + app[i].PID)
            }
        }
    }
})

require('./boot/index')(app);


require('./routes/index')(app);

//\module.exports = app;

