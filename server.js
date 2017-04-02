var express = require('express');
var bodyParser = require('body-parser');
const uuidV1 = require('uuid/v1');
var chalk = require('chalk');
var app = express();

var log = function() {
  var string = chalk.grey(new Date() + ' : ');
  Array.from(arguments).forEach(function(argument) {
    if (typeof argument === "string") {
      string += chalk.green(argument)
    } else if (typeof argument === "Object") {
      string += chalk.purple(JSON.stringify(arguments));
    } else {
      string += chalk.blue(argument.toString());
    }
  })
  console.log(string);
}
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

var commands = [];

app.listen(9000, function() {

});

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render(__dirname + '/index.ejs', { commands });
});

app.get('/commands', function(req, res) {
  log(chalk.blue('GET /commands'))
  var newCommands = [];
  commands.forEach(function(command) {
    if (command.status === null) {
      newCommands.push(command);
    }
  })
  res.send(newCommands);
});


app.post('/add', function(req, res) {
  var command = processCommand(req.body.command);
  commands.push({
    id: uuidV1(),
    string: req.body.command,
    command,
    status: null
  });
  res.redirect('/');
});

app.post('/update', function(req, res) {
  log(chalk.blue('POST /update'));
  log(chalk.grey(JSON.stringify(req.body)))
  var { id, status, stdout, stderr } = req.body;
  commands.forEach(function(command, index) {
    if (command.id === id) {
      commands[index].status = status;
      log(chalk.green(stdout))
      commands[index].stdout = stdout;
      log(chalk.red(stderr))
      commands[index].stderr = stderr;
      log(chalk.green('Command Updated'));
      console.log(commands[index])
      res.send();
    }
  });
})

function processCommand(command) {
  log(chalk.blue(command))
    //notify-send 'hello'
    //programs[0] = notify-send
    //programs[1] = 'hello'
  var program = command.split(' ');
  if (program.length === 1) {
    return { program: program[0], args: [] }
  } else {
    return {
      program: program[0],
      args: program.splice(program.length - 1)
    }

  }
}
