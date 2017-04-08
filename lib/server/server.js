var express = require('express');
var bodyParser = require('body-parser');
const uuidV1 = require('uuid/v1');
var chalk = require('chalk');
var log = require('../common/utils').log;
var _ = require('lodash');
var Commands = require('../models/Commands');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var passport = require('passport');
var session = require('express-session');
var GoogleStrategy = require('passport-google-oauth2').Strategy;

GoogleStrategy.prototype.userProfile = function (token, done) {
  done(null, {});
};

var globalSocket;

var numOfClients = 0;
io.on('connection', function (socket) {
  ++numOfClients;
  globalSocket = socket;
  log(chalk.green('Client connected', numOfClients));
  if (commands.get().length) {
    emitCommands();
  }

  socket.on('update', function (data) {
    log('WS Update');
    commands.update(data);
    socket.broadcast.emit('update', JSON.stringify(data));
    socket.emit('update', JSON.stringify(data));
  });
  socket.on('add', function (command) {
    log(chalk.blue('WS add'));
    commands.addToQueue(command);
    emitCommands();
  });

  socket.on('disconnect', function () {
    numOfClients--;
  });
});

var commands = new Commands();
var config = {
  port: process.env.PORT || 9000
};

app.use(bodyParser.urlencoded({
  extended: true
}));
passport.use(new GoogleStrategy({
  clientID: process.env.clientId,
  clientSecret: process.env.secret,
  callbackURL: "http://localhost:9000/auth/callback",
  passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
  console.log(profile);
  done(null, profile);
}));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

app.use(bodyParser.json());
app.use(express.static(__dirname + '/../public'));
app.use(session({
  secret: 'cookie_secret',
  name: 'kaas',
  proxy: true,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

server.listen(config.port, () => {
  log('Server listening on', config.port);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile']
}));

app.get('/auth/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/'
}));

app.set('view engine', 'ejs');

app.get('/admin', function (req, res) {
  res.render(__dirname + '/../public/index.ejs', { commands: commands });
});

app.get('/', ensureAuthenticated, function (req, res) {
  res.render(__dirname + '/../public/commands.ejs', { commands: commands });
});

app.get('/login', function (req, res) {
  res.render(__dirname + '/../public/login.ejs');
});

app.get('/', function (req, res) {
  res.render(__dirname + '/../public/commands.ejs', { commands: commands });
});

app.get('/commands', function (req, res) {
  log(chalk.blue('GET /commands'));
  res.json(commands.get());
});

app.post('/add', function (req, res) {
  log(chalk.blue('POST /add'));
  log(req.body.command);
  commands.addToQueue(req.body.command);
  emitCommands();
  res.redirect('/');
});

app.post('/redo', function (req, res) {
  log(chalk.blue('POST /redo'));
  commands.redo(req.body.id);
  emitCommands();
  res.redirect('/');
});

app.post('/update', function (req, res) {
  log(chalk.blue('POST /update'));
  log(chalk.grey(JSON.stringify(req.body)));
  commands.update(req.body);
  res.send();
});

var emitCommands = function () {
  if (globalSocket) {
    log(chalk.blue('Sending Commands'));
    globalSocket.broadcast.emit('newcommands', commands.get(true));
    globalSocket.emit('commands', commands.getAll());
  }
};
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}