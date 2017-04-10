const uuidV1 = require('uuid/v1');
var _ = require('lodash');
var log = require('../common/utils').log;
var Queue = require('../models/Queue');
var chalk = require('chalk');
module.exports = function Commands() {

  var commands = [];

  this.get = function(update) {
    log('Commands:get')
    var newCommands = [];
    _.each(commands, function(command) {
      if (command.status === 'new') {
        if(update){
          commands[command.id].status = 'sent';
        }
        newCommands.push(command);
      }
    })
    return newCommands;
  }

  this.next = function(){
    log('Commands: next');

    if(!commands.length){
      log('No commands found');
      return null
    } 

    return commands.shift()
  }

  this.getAll = function() {
    log('Commands:getAll')
    return _find(commands,function(value){
        return value.status !== 0
    });
  }

  this.addToQueue = function(command, timeout) {
    log('Commands:add')

    var executionLines = this.processCommand(command)

    _.each(executionLines, function(line) {
      let id = uuidV1();
      log('Pusing each line of command to queue')
      commands.push({
        id: id,
        command: line,
        status: 'new',
        timeout: (timeout && parseInt(timeout)) || -1
      });
    })
    log('Commands pushed successfully')
  }

  this.processCommand = function(command) {
    log('Starting Command Processing')
    command = command.replace(/\r/, '')

    var executionLines = [],
      lines = command.split('\n');


    lines = _.compact(lines);
    _.each(lines, function(line) {
      executionLines.push(line);
    })
    log('Finished Command Processing');
    return executionLines;
  }
}
