'use strict';

module.exports = function(app, config){
    var server = app.server;
    io = require('socket.io')(server);

    io.on('connection', function(socket){

    });
};
