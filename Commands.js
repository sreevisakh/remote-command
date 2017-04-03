const uuidV1 = require('uuid/v1');
var _ = require('lodash');
var log = require('./utils').log;

module.exports = function Commands() {

  var commands = {};

  this.find = function(data) {
    log('Commands:find - ', data)
    if (typeof data === 'string') {
      return commands[data];
    } else if (data.id) {
      return commands[data.id];
    }
  };

  this.get = function() {
    log('Commands:get')
    var newCommands = [];
    _.each(_.values(commands), function(command) {
      if (command.status === 'new') {
        commands[command.id].status = 'sent';
        newCommands.push(command);
      }
    })
    return newCommands;
  }

  this.getAll = function() {
    log('Commands:getAll')
    return _.values(commands);
  }

  this.addToQueue = function(command, timeout) {
    log('Commands:addToQueue')

    var executionLines = this.processCommand(command)
    _.each(executionLines, function(line) {
      let id = uuidV1();
      commands[id] = {
        id: id,
        string: command,
        command: line,
        status: 'new',
        timeout: parseInt(timeout) || -1
      }
    })

  }
  this.redo = function(id) {
    var objCommand = _.clone(this.find(id));
    let newId = uuidV1();
    commands[id] = {
      id: newId,
      string: objCommand.string,
      command: objCommand.command,
      status: 'new',
      timeout: parseInt(objComman.timeout) || -1
    }
  }

  this.update = function(data) {
    log('Commands:update')
    if (data.id) {
      commands[data.id].status = data.status;
      commands[data.id].stdout = data.stdout;
      commands[data.id].stderr = data.stderr;
    }
  }

  this.processCommand = function(command) {
    log('Commands:processCommand')
    var executionLines = [],
      lines = command.split('\n');

    lines = _.compact(lines);
    _.each(lines, function(line) {
      executionLines.push(lineToArgument(line));
    })
    return executionLines;
  }

  function lineToArgument(command) {
    log('Commands:lineToArgument')
    var program = command.split(' ');
    if (program.length === 1) {
      return { program: program[0], args: [] }
    } else {
      return {
        program: program[0],
        args: program.slice(1)
      };
    }
  }
}
