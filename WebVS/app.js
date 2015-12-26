var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan');
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    routes = require('./routes/index'),
    users = require('./routes/users'),
    login = require('./routes/login'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(session);
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

mongoose.connect('mongodb://nhost.cloudapp.net:27017/WebVS');
var db = mongoose.connection;
global.dbConnection = db;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Successfully connected!');
});

app.use(session({
    secret: 'sdfasdfasdfasdf',
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

//app.User = User = require('./models.js').User(db);

app.use('/', routes);
app.use('/login', login);
app.use('/users', users);






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