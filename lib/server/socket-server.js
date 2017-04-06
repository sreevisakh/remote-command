var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(9000);

io.on('connection', function (socket) {
  console.log('Incoming Connection');
  console.log('Emiting Commands"');
  socket.emit('commands', ['ls', 'ls -l']);
  socket.on('update', function (data) {
    console.log('Incoming Update');
    console.log(data);
  });
});