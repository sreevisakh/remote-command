var express = require('express');
var bodyParser = require('body-parser');
const uuidV1 = require('uuid/v1');
var chalk = require('chalk');
var log = require('../common/utils').log;
var _ = require('lodash');
var Commands = require('../models/Commands');
var childProcess = require("child_process");

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
  log(chalk.blue('Request received to add command'));
  log(chalk.blue('Adding Command'));
  commands.addToQueue(req.body.command);
  log('Starting execution of commands')
  executeCommand(function(response){
    res.send(response);  
  });
  
});

app.listen(config.port, () => {
  log('Server listening on ', config.port);
});


//Functiontions

var commands = new Commands();
var commandRunning = false;


var executeCommand = function(callback) {
  log('Executing Commands')
  if (commandRunning) {
    log(chalk.red('Already somebody is getting executed, I can\'t watch this, returning'));
    return;
  }
  
  var newCommand = commands.next();
  if (newCommand) {
  log('Got next command');  
  log(chalk.green('Executing: ' + newCommand.command));
    var stdout = '',
      stderr = '',
      status;
    commandRunning = true;
    var child = childProcess.exec(newCommand.command, function(error, stdout, stderr) {
      var update = { 
          id: newCommand.id,
          status:  child.exitCode,
          stdout: stdout,
          stderr: stderr
        }
      commandRunning = false;
      callback(update);
      log(chalk.green('Command Execution finished'));
    });
  }
  else{
    callback(chalk.red("No Commands to Execute"));
  }
}
