'use strict';
var io;
module.exports = function(app, config){
    var server = app.server;
    io = require('socket.io')(server);

    io.on('connection', function(socket){
        console.log('connection');

        socket.on('device.register', function(data){
            console.log('device registered', data);
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
        });

        socket.on('chat message', function(msg){
            console.log('message: ' + msg);
        });
        
        socket.on('device.add', function(data){
            console.log('We have a visitor', data);

        });

        socket.on('device.remove', function(data){
            console.log('We\'ve lost a visitor', data);
        });
    });
};
