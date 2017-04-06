var request = require('request');
var Queue = require('../models/Queue');
var childProcess = require("child_process");
var log = require('../common/utils').log;
var io = require('socket.io-client');

var commandQueue = new Queue();
var commandRunning = false;

const config = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 9000,
  protocol: process.env.PROTOCOL || 'http',
  timeout: process.env.TIMEOUT || 3000,
  pollingInterval: process.env.INTERVAL || 3000,
  uid: 0,
  gid: 0,
  id: process.env.id || 'DellLaptop'
}


var socket = io(`http://${config.host}:${config.port}`);
log('Connecting to server');
socket.on('connect', function(){
  log(`Connected to server: host: ${socket.io.opts.hostname}, port: ${socket.io.opts.port}`);
  console.log()
  socket.on('commands',function(data){
    log('Got Commands from server', data);
    data.forEach(function(objCommand) {
      log(objCommand.command);
      commandQueue.enqueue(objCommand);
    })
    executeCommands();
  });
});
//
// var getCommands = function() {
//   console.log('GET /commands')
//   request(`http://${config.host}:${config.port}/commands`, function(error, response) {
//     if (error) {
//       console.error('Error while fetching commands');
//       return;
//     }
//     try {
//       data = JSON.parse(response.body);
//     } catch (e) {
//       console.error('Unable to parse Response')
//       data = [];
//     }
//
//     if (data.length) {
//       console.log('Got Commands', data)
//       data.forEach(function(objCommand) {
//         console.log(objCommand.command)
//         commandQueue.enqueue(objCommand);
//       })
//     }
//   });
//   executeCommands();
// }

// setInterval(getCommands, config.pollingInterval);
//

var executeCommands = function() {
  log('Running executeCommand')
  if (commandRunning) {
    return;
  }

  var newCommand = commandQueue.dequeue();
  if (newCommand) {
  log('Executing' + newCommand);
    var stdout = '',
      stderr = '',
      status;
    commandRunning = true;
    var child = childProcess.exec(newCommand.command, function(error, stdout, stderr) {
      log('Send Update to server');
      updateCommandStatus(newCommand, child.exitCode, stdout, stderr, function() {
        commandRunning = false;
      });
    });
  }
}

var updateCommandStatus = (command, status, stdout, stderr, cb) => {
  log('Updating Command Status');
  // request({
  //   method: 'POST',
  //   url: `${config.protocol}://${config.host}:${config.port}/update`,
  //   json: {
  //     id: command.id,
  //     status: status,
  //     stdout: stdout,
  //     stderr: stderr
  //   }
  // }, function(error, response) {
  //   if (error) {
  //     console.log('Unable to update command status', error)
  //   }
  //   cb();
  // })
  socket.emit('update',
    { id: command.id,
      status: status,
      stdout: stdout,
      stderr: stderr
    });
    cb();
}
