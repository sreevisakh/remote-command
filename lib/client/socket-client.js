var io = require('socket.io-client');

var socket = io('http://localhost:9000');
console.log('Connecting to server');
socket.on('connect', function (server) {
  console.log('Connected to server', server);

  console.log('Emiting update');
  socket.emit('update', 'This is an update');

  socket.on('commands', function (data) {
    console.log('Got Commands from server');
    console.log('We got a message: ', data);
  });
});