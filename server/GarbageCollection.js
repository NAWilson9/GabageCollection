/**
 * Created by nick on 2/20/16.
 */
//Link dependencies
var express = require('express');
var sockets = require('socket.io');

//Setup server
var app = express();
var io = sockets();
var server;
var port = 1337;
var serverName = 'GarbageCollection';

app.use(express.static('../client/', {
    extensions: ['html'],
    index: 'index.html'
}));

/*
 Server functions
 */

//Handles the initial server setup before starting
var initializeServer = function(functions, startServer) {
    var progress = 0;
    var completion = functions.length;
    //Callback for each startup method
    var callback = function () {
        progress++;
        if(progress === completion){
            //All setup is finished
            console.log('All setup completed');
            startServer();
        }
    };
    //Invokes all linked functions
    for (var i = 0; i < completion; i++) {
        functions[i](callback);
    }
};

//Starts the server
(function(){
    //Link required startup methods
    var functions = [];

    //What to do once initialization finishes
    var start = function(){
        //Starts the Express server
        server = app.listen(port, function () {
            //Server started
            console.log(serverName + ' web server running on port ' + port);

            //Start socket server
            io.listen(server);
            console.log(serverName + ' socket server running on port ' + port);
        });
    };
    if(functions.length){
        initializeServer(functions, start);
    } else {
        start();
    }
})();

/*
 Websocket stuff
 */


//Socket routes
io.on('connection', function (socket) {
    var room;
    console.log(new Date().toLocaleTimeString() + ' | A user has connected. IP Address: ' + socket.handshake.address +  ' Total users: ' + io.engine.clientsCount);
    //On connect, send client current info

    /*
     ** Client Requests
     */
    socket.on('/buttonPressed', function(data){
        console.log('Button pressed: ' + data);
        socket.to(room).emit('/buttonPressedd', 'aaaa');
    });

    socket.on('/joinRoom', function(data){
        room = data;
        socket.join(room);
        console.log('Join: ' + JSON.stringify(socket.rooms));
    });

    socket.on('/leaveRoom', function(data){
        socket.leave(room);
        room = '';
        console.log('Leave: ' + JSON.stringify(socket.rooms));
    });

    //A user has disconnected
    socket.on('disconnect', function (data) {
        console.log(new Date().toLocaleTimeString() + ' | A user has disconnected. Total users: ' + io.engine.clientsCount);
    });

    //Socket functions
});