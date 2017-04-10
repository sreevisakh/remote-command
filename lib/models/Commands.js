const uuidV1 = require('uuid/v1');
var _ = require('lodash');
var log = require('../common/utils').log;
var Queue = require('../models/Queue');
var chalk = require('chalk');
module.exports = function Commands() {

  var commands = {};
  var commandQueue = new Queue();

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

  this.next = function () {
    try {
      if (commandsQueue.length) {
        return commans[commandQueue.dequeue()];
      }
    } catch (error) {
      log(chalk.red(error));
    }
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
      commandQueue.enqueue(id);
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
    commandQueue.enquque(newId);
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
};