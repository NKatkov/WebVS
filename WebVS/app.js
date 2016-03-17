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

app.use(function (req, res, next) {
    res.locals = {
        CheckRole: function (menu) {
            console.log(req.session.role)
            if (req.session.role == "admin") {
                return true
            } else if (req.session.role == "user") {
                return false
            }
        },
        Name: req.session.nick
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