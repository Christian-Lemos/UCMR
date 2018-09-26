#!/usr/bin/env node

/**
 * Module dependencies.
 */
var fs = require('fs');
var yargs = require('yargs').argv;
var confArquivo = JSON.parse(fs.readFileSync('./bin/configuracoes.json', 'utf8'));
var conf = confArquivo;
var croner = require("./../models/croner")

for(var chave in confArquivo.init)
{
  conf.init[chave] = (yargs[chave]) ? yargs[chave] : confArquivo.init[chave];
}

var portaPrincipal = conf.init.webport.toString();

console.log("-----------------------");
console.log("Porta Servidor Web: " + portaPrincipal);

var app = require('../app')(conf);

if(yargs["set"] && yargs["set"] == true)
{
  console.log("Salvando configurações...");
  fs.writeFile("./bin/configuracoes.json", JSON.stringify(conf, null, 4), 'utf8', function(err)
  {
    if(err)
    {
      console.error("Erro ao salvar as configurações");
    }
    else
    {
      console.log("Configurações salvadas com sucesso");
    }
  });
}
var debug = require('debug')('startapp:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || portaPrincipal);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  croner.start();
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}