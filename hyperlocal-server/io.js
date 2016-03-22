'use strict';
var io;
module.exports = function(app, config){
    var server = app.server;
    io = require('socket.io')(server);

    app.io = io;

    io.on('connection', function(socket){
        console.log('socket connected', socket.id);

        socket.on('device.register', function(data){
            console.log('device registered', data);
            socket.join(data.uuid);
        });

        socket.on('disconnect', function(){
            console.log('socket disconnected', socket.id);
        });

        socket.on('chat message', function(msg){
            console.log('message: ' + msg);
        });

        socket.on('device.check-in', function(data){
            console.log('device.check-in:', data);
            socket.to(data.uuid).emit('service.found', {
                id: data.id,
                services: data.services
            });
        });

        socket.on('device.remove', function(data){
            console.log('We\'ve lost a visitor', data);
            socket.to(data.uuid).emit('service.exited', {
                id:'one'
            });
        });

        socket.on('dev.force.presence', function(data){
            console.log('SIM: We have a visitor', data);
            socket.to(data.uuid).emit('service.found', {
                id: data.id,
                services: data.services
            });
        });
    });
};
