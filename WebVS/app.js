var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    routes = require('./routes/index'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    auth = require('./routes/auth'),
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




var fn = {};
fn.dateToStr = function (d,f) {

    return 'formate date';
}
function remoteIP(req) {
    var headers = req.headers;
    var proxy_ip = headers['x-real-ip'] || headers['x-forwarded-for']
    if (proxy_ip)
        return proxy_ip;
    if (req.connection) {
        if (req.connection.remoteAddress)
            return req.connection.remoteAddress.replace('::ffff:', '');
    }
    
    if (req.ip)
        return req.ip;
}
fn.trim = function (str, charlist) {
    charlist = !charlist ? ' \\s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
    return str.replace(re, '');
}
fn.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
fn.toTranslit = function (text) {
    return trim(text).replace(/[/.,!?;]*/g, '').replace(/([à-ÿ¸])/gi, function (all, char) {
        var code = char.charCodeAt(0),
            index = code == 1025 || code == 1105 ? 0 : code > 1071 ? code - 1071 : code - 1039,
            t = ['yo', 'a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p',
                'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh', 'shch', '', 'y', '', 'e', 'yu', 'ya'];
        
        return char.toLowerCase() === char ? t[ index ].toLowerCase() : t[ index ];
    }).replace('?', '').replace(/ /g, '-');
}


app.use(function (req, res, next) {
    if (req.session.user) {
        req.user = new db.User(req.session.user);
    }
    next();
});

app.use(function (req, res, next) {
    req.remoteIP = remoteIP(req);
    next();
});



app.use(function (req, res, next) {
    res.locals = {
        app: {
            user: req.user,
            fn: fn
        }
    };
    next();
});


app.use('/', routes);
app.use('/auth/login', routes);

app.use('/auth', auth);
app.use('/man/srv', require('./routes/srv'));
app.use('/man/users', require('./routes/users'));
app.use('/man/package', require('./routes/package'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;