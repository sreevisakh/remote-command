var request = require('request');
var Queue = require('./Queue');
var childProcess = require("child_process");

var commandQueue = new Queue();

var commandRunning = false;

const config = {
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT || 9000,
  protocol: process.env.PROTOCOL || 'http',
  timeout: process.env.TIMEOUT || 3000,
  pollingInterval: process.env.INTERVAL || 3000,
  uid: 0,
  gid: 0,
  id: process.env.id || 'DellLaptop'
}

var getCommands = function() {
  console.log('GET /commands')
  request(`http://${config.host}:${config.port}/commands`, function(error, response) {
    if (error) {
      console.error('Error while fetching commands');
      return;
    }
    try {
      data = JSON.parse(response.body);
    } catch (e) {
      console.error('Unable to parse Response')
      data = [];
    }

    if (data.length) {
      console.log('Got Commands', data)
      data.forEach(function(objCommand) {
        console.log(objCommand.command)
        commandQueue.enqueue(objCommand);
      })
    }
  });
  executeCommands();
}

setInterval(getCommands, config.pollingInterval);


var executeCommands = function() {
  console.log('Running executeCommand')
  if (commandRunning) {
    return;
  }

  var newCommand = commandQueue.dequeue();
  if (newCommand) {

    var stdout = '',
      stderr = '',
      status;
    commandRunning = true;
    var child = childProcess.exec(newCommand.command, function(error, stdout, stderr) {
      updateCommandStatus(newCommand, child.exitCode, stdout, stderr, function() {
        commandRunning = false;
      });
    });
  }
}

var updateCommandStatus = (command, status, stdout, stderr, cb) => {
  console.log('Update Command Status')
  request({
    method: 'POST',
    url: `${config.protocol}://${config.host}:${config.port}/update`,
    json: {
      id: command.id,
      status: status,
      stdout: stdout,
      stderr: stderr
    }
  }, function(error, response) {
    if (error) {
      console.log('Unable to update command status', error)
    }
    cb();
  })
}
