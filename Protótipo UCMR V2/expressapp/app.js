var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

const JSON = require('circular-json');

var servmqtt = require('./servidor-mqtt.js');

var paginasRouter = require('./routes/paginas');
var debugRouter = require('./routes/debug');
var comandosRouter = require('./routes/comandos');
//var usersRouter = require('./routes/users');


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.locals.autor = "UFSM"
app.locals.versao = "Pre-Alpha V2";
app.locals.anoAtual = new Date().getFullYear();
app.locals.modoDebug = true;
app.locals.clientesConectados = [];
app.locals.servidorMosca = new servmqtt();

app.use('/', paginasRouter);
app.use('/debug', debugRouter);
app.use('/comandos', comandosRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
