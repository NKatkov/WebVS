var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan');
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    routes = require('./routes/index'),
    users = require('./routes/users'),
    app = express();

var SessOpt = {
    secret: 'keyboard cat', 
    unset: "destroy",
    cookie: { maxAge: 10000 }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(SessOpt))
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'))).listen(8080);
app.use('/', routes);
app.use('/users', users);


app.get('/login', function (req, res, next) {
    var sess = req.session
    if (!sess.user) {
        res.setHeader('Content-Type', 'text/html')
        sess.user = 'Nikolay'
        res.write('<p>User:' + sess.user + '</p>')
        res.end()
    } else {
        res.redirect('/'); 
    }
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});




module.exports = app;