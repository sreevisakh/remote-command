var assert = require('assert');
var Commands = require('./Commands');
var commands;

beforeEach(function() {
  commands = new Commands()
});

describe('Commands', function() {
  describe('processCommand', function() {
    it('should return first argument in prograns', function() {
      var command = commands.processCommand('ls -l');
      assert.equal('ls', command[0].program);
    });

    it('should return arguments as second params', function() {
      var command = commands.processCommand('ls -l -a -t -c');
      assert.equal('ls', command[0].program);
      assert.equal('-l', command[0].args[0]);
      assert.equal('-a', command[0].args[1]);
      assert.equal('-t', command[0].args[2]);
    });


    it('should work with multiple params', function() {
      var command = commands.processCommand('ls -l');
      assert.equal('-l', command[0].args[0]);
    });


    it('should return array for multiline commands', function() {
      var command = commands.processCommand('ls -l\ncat /etc/hosts');
      assert.equal('ls', command[0].program);
      assert.equal('-l', command[0].args[0]);
      assert.equal('cat', command[1].program);
      assert.equal('/etc/hosts', command[1].args[0]);
    });
  });
});
