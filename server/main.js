var app = require('express')();
const express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(80);
// WARNING: app.listen(80) will NOT work here!

console.log("GO to http://localhost:80")

const public = path.join(__dirname, '..', 'public');

app.use(express.static(public));

app.get('/', function (req, res) {
  res.sendFile(path.join(public, 'index.html'));
});


io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});