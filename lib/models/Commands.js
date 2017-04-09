const uuidV1 = require('uuid/v1');
var _ = require('lodash');
var log = require('../common/utils').log;

module.exports = function Commands() {

  var commands = {};

  this.find = function (data) {
    log('Commands:find - ', data);
    if (typeof data === 'string') {
      return commands[data];
    } else if (data.id) {
      return commands[data.id];
    }
  };

  this.get = function (update) {
    log('Commands:get');
    var newCommands = [];
    _.each(_.values(commands), function (command) {
      if (command.status === 'new') {
        if (update) {
          commands[command.id].status = 'sent';
        }
        newCommands.push(command);
      }
    });
    return newCommands;
  };

  this.getAll = function () {
    log('Commands:getAll');
    return _.values(_find(commands, function (value) {
      return value.status !== 0;
    }));
  };

  this.addToQueue = function (command, timeout) {
    log('Commands:addToQueue');

    var executionLines = this.processCommand(command);
    log('Commands: Processed Commands');
    _.each(executionLines, function (line) {
      let id = uuidV1();
      commands[id] = {
        id: id,
        command: line,
        status: 'new',
        timeout: timeout && parseInt(timeout) || -1
      };
    });
  };
  this.redo = function (id) {
    var objCommand = _.clone(this.find(id));
    let newId = uuidV1();
    commands[newId] = {
      id: newId,
      command: objCommand.command,
      status: 'new',
      timeout: parseInt(objCommand.timeout) || -1
    };
  };

  this.update = function (data) {
    log('Commands:update');
    if (data.id && commands[data.id]) {
      commands[data.id].status = data.status;
      commands[data.id].stdout = data.stdout;
      commands[data.id].stderr = data.stderr;
    }
  };

  this.processCommand = function (command) {
    log('Commands:processCommand');
    command = command.replace(/\r/, '');

    var executionLines = [],
        lines = command.split('\n');

    lines = _.compact(lines);
    _.each(lines, function (line) {
      executionLines.push(line);
    });
    return executionLines;
  };

  function lineToArgument(command) {
    // log('Commands:lineToArgument')
    // if (command.indexOf('#') > -1) {
    //   command = command.substr(0, command.indexOf('#'));
    // }

    // var program = command.split(' ');
    // if (program.length === 1) {
    //   return { program: program[0], args: [] }
    // } else {
    //   return {
    //     program: program[0],
    //     args: _.compact(program.slice(1))
    //   };
    // }
    return command;
  }
};