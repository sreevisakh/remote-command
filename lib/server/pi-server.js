var express = require('express');
var bodyParser = require('body-parser');
const uuidV1 = require('uuid/v1');
var chalk = require('chalk');
var log = require('../common/utils').log;
var _ = require('lodash');
var Commands = require('../models/Commands');

//config Section

var config = {
  port: process.env.PORT || 9000
};

//express Section

var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.use(express.static(__dirname + '/../public'));

app.set('view engine', 'ejs');

app.get('/admin', function (req, res) {
  res.render(__dirname + '/../public/index.ejs', { commands: commands });
});

app.get('/', function (req, res) {
  res.render(__dirname + '/../public/commands.ejs', { commands: commands });
});

app.post('/add', function (req, res) {
  log(chalk.blue('POST /add'));
  log(req.body.command);
  commands.addToQueue(req.body.command);
  executeCommand();
  res.redirect('/');
});

server.listen(config.port, () => {
  log('Server listening on', config.port);
});

//Functiontions

var commands = new Commands();

var executeCommands = function () {
  log('Running executeCommand');
  if (commandRunning) {
    return;
  }
  var newCommand = commandQueue.dequeue();
  if (newCommand) {
    log(chalk.green('Executing' + newCommand.command));
    var stdout = '',
        stderr = '',
        status;
    commandRunning = true;
    var child = childProcess.exec(newCommand.command, function (error, stdout, stderr) {
      log('Send Update to server');
      commands.update({ id: command.id,
        status: child.exitCode,
        stdout: stdout,
        stderr: stderr
      });
      commandRunning = false;
    });
  }
};