//
// Change History:
// 20160318 : RJP : Copied from stage.puca.me:/home/puca/pucatrade-future/socket.jc
// -------------------------


var createServer = function (port, host) {
    var app = require('express')();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    var args = [port, host, function () {
        console.log('listening on ', [host, port].join(':'));
    }].filter(function (el) {return !!el});

    http.listen.apply(http, args);
    return {io: io, app: app, http: http};
};
var clientServer = createServer(3333);
//var serverServer = createServer(5555, 'localhost');

clientServer.io.on('connection', function (socket) {
    console.log('client connected');
    //replace with your own socket authentication function
    var authenticated = true;
    if (!authenticated) {
        socket.disconnect();
    }

    socket.on('subscribe', function (data) {
        console.log("a user joined channel: " + data.channel);
        socket.join(data.channel);
    });
    socket.on('unsubscribe', function (data) {
        console.log("a user left channel: " + data.channel);
        socket.leave(data.channel);
    });

    socket.on('disconnect', function () {
        console.log('a user disconnected');
    });
});

//serverServer.io.on('connection', function (socket) {
clientServer.io.on('connection', function (socket) {
    socket.on('murmur', function (msg) {
        console.log("sending murmur to channel: " + msg.target);
        clientServer.io.sockets.in(msg.target).emit(msg.event, msg);
        clientServer.io.sockets.in(msg.origin).emit(msg.event, msg);
    });

    socket.on('blast', function (msg) {
        clientServer.io.emit(msg.event, msg);
    });
});
