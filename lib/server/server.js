var express = require('express');
var bodyParser = require('body-parser');
const uuidV1 = require('uuid/v1');
var chalk = require('chalk');
var log = require('../common/utils').log;
var _ = require('lodash');
var Commands = require('../models/Commands');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var globalSocket;

io.on('connection', function (socket) {
  globalSocket = socket;
  log(chalk.green('Client connected'));
  emitCommands();

  socket.on('update', function (data) {
    console.log('Incoming Update', data);
    commands.update(data);
  });
});

var commands = new Commands();
var config = {
  port: process.env.PORT || 9000
};

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../public'));

server.listen(config.port, function () {
  console.log('Server listening on', config.port);
});

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render(__dirname + '/../public/index.ejs', { commands: commands });
});

app.get('/commands', function (req, res) {
  log(chalk.blue('GET /commands'));
  res.json(commands.get());
});

app.post('/add', function (req, res) {
  log(chalk.blue('POST /add'));
  commands.addToQueue(req.body.command);
  emitCommands();
  res.redirect('/');
});

app.post('/redo', function (req, res) {
  log(chalk.blue('POST /redo'));
  commands.redo(req.body.id);
  emitCommands();
  res.redirect('/');
});

app.post('/update', function (req, res) {
  log(chalk.blue('POST /update'));
  log(chalk.grey(JSON.stringify(req.body)));
  commands.update(req.body);
  res.send();
});

var emitCommands = function () {
  if (globalSocket) {
    log(chalk.blue('Sending Commands'));
    globalSocket.emit('commands', commands.get());
  }
};
