var express = require('express');
var bodyParser = require('body-parser');
const uuidV1 = require('uuid/v1');
var chalk = require('chalk');
var log = require('./utils').log
var _ = require('lodash');
var Commands = require('./Commands');


var app = express();
var commands = new Commands();
var config = {
  port: 9000 || process.env.PORT
}

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/'));

app.listen(config.port, function() {
  console.log('Server listening on, config.port')
})

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render(__dirname + '/index.ejs', { commands: commands });
});

app.get('/commands', function(req, res) {
  log(chalk.blue('GET /commands'));
  res.json(commands.get());
});


app.post('/add', function(req, res) {
  log(chalk.blue('POST /add'));
  commands.addToQueue(req.body.command);
  res.redirect('/');
});

app.post('/redo', function(req, res) {
  log(chalk.blue('POST /redo'));
  commands.redo(req.body.id)
  res.redirect('/');
})

app.post('/update', function(req, res) {
  log(chalk.blue('POST /update'));
  log(chalk.grey(JSON.stringify(req.body)))
  commands.update(req.body)
  res.send();
});
