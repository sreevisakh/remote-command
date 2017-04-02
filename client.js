var request = require('request');
var stack = require('./Stack');
var childProcess = require("child_process");
(function() {

  var oldSpawn = childProcess.spawn;

  function mySpawn() {
    console.log('spawn called');
    console.log(arguments);
    var result = oldSpawn.apply(this, arguments);
    return result;
  }
  childProcess.spawn = mySpawn;
})();

const spawn = childProcess.spawn;

var commandStack = new stack();
var commandRunning = false;
const config = {
  host: '127.0.0.1',
  port: 9000
}

var getCommands = function() {
  console.log('Gettings Commands from server');
  request(`http://${config.host}:${config.port}/commands`, function(error, response, data) {
    if (error) {
      console.error('Error while fetching commands');
      return;
    }
    console.log('Got Comamnds', response.body)
    JSON.parse(response.body).forEach(function(objCommand) {
      console.log(objCommand.command)
      commandStack.push(objCommand);
      executeCommands();

    })
  })
}

setInterval(getCommands, 3000);


var executeCommands = function() {
  console.log('Running executeCommand')
  if (commandRunning) {
    return;
  }

  var newCommand = commandStack.pop();
  if (newCommand) {

    var stdout = '',
      stderr = '',
      status;
    var program = newCommand.command.program;
    var args = newCommand.command.args.length ? newCommand.command.args : [];
    const child = spawn(program, args);
    commandRunning = true;
    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      stdout += data;
    });

    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
      stderr += data;
    });

    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      status = code;
      updateCommandStatus(newCommand, status, stdout, stderr, function() {
        commandRunning = false;
      })

    });
  }
}
var updateCommandStatus = (command, status, stdout, stderr, cb) => {
  console.log('Update Command Status')
  request({
    method: 'POST',
    url: `http://${config.host}:${config.port}/update`,
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
