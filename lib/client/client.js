var request = require('request');
var Queue = require('../models/Queue');
var childProcess = require("child_process");
var log = require('../common/utils').log;
var io = require('socket.io-client');
var chalk = require('chalk');
var Scheduler = require('../models/Scheduler');
var commandQueue = new Queue();
var commandRunning = false;

const config = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 9000,
  protocol: process.env.PROTOCOL || 'http',
  timeout: process.env.TIMEOUT || 3000,
  pollingInterval: process.env.INTERVAL || 1000,
  uid: 0,
  gid: 0,
  id: process.env.id || 'DellLaptop'
};
var scheduler = new Scheduler();
var phoneSatate = false;

scheduler.mobileCheck({ip : '192.168.1.111', interval : config.pollingInterval}, function(handle, isAlive){
  if(phoneSatate != isAlive){
    log(chalk.blue('Phone Availability Changed,' + (isAlive? 'Available':'Not Available')));
    phoneSatate = isAlive;
    if(isAlive){
      execute('light-on');
    }
    else{
      execute('light-off');
    }
  }

})

scheduler.bleCheck();

var socket = io(`http://${config.host}:${config.port}`);
log('Connecting to server');
socket.on('connect', function () {
  log(`Connected to server: host: ${socket.io.opts.hostname}, port: ${socket.io.opts.port}`);
  socket.on('newcommands', function (data) {
    log('Got Commands from server', data);
    data.forEach(function (objCommand) {
      log(objCommand.command);
      commandQueue.enqueue(objCommand);
    });
    executeCommands();
  });
});

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
      updateCommandStatus(newCommand, child.exitCode, stdout, stderr, function () {
        commandRunning = false;
      });
    });
  }
};

var updateCommandStatus = (command, status, stdout, stderr, cb) => {
  log('Updating Command Status');
  request({
    url : `http://${config.host}:${config.port}/update`,
    mehtod : 'POST',
    json :{
      id: command.id,
      status: status,
      stdout: stdout,
      stderr: stderr
    }
  }, function(err, response){
    cb();
  })
};

function execute(command){
  log(chalk.red('Automation Execute : '+command))
  childProcess.exec(command)
}
