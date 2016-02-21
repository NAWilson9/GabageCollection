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
    console.log(new Date().toLocaleTimeString() + ' | A user has connected. IP Address: ' + socket.handshake.address +  ' Total users: ' + io.engine.clientsCount);

    //Receive client status data and send to all other clients
    socket.on('updateClientStatus', function(data){
        socket.to(socket.currentRoom).emit('updateGlobalStatus', data);
        //console.log(new Date().toLocaleTimeString() + ' | Client data received in room "' + socket.currentRoom + '" from "' + socket.username + '".');
        //console.log(data);
    });

    //A user has requested to set their username
    socket.on('setUsername', function (newName, callback){
        if(!newName){
            callback("Can't set username to null/undefined/empty string/false.")
        } else if(socket.currentRoom){
            callback("Can't change username while in a room.");
        } else if(socket.username === newName){
            callback("Can't set username to the same value.");
        } else {
            var oldName = socket.username;
            socket.username = newName;
            callback('good');
            console.log(new Date().toLocaleTimeString() + ' | A user has changed their name from "' + oldName + '" to "' + socket.username + '".');
        }
    });

    //A user requested to join a room
    socket.on('joinRoom', function(roomName, callback){
        if(!roomName){
            callback("Can't join room name of value null/undefined/empty string/false.")
        } else if(socket.currentRoom){
            callback("Can't join a new room if the user is already in one.");
        } else {
            socket.currentRoom = roomName;
            //Get list of users already in the room
            var users = [];
            try{
                var socketIdsInRoom = io.sockets.adapter.rooms[socket.currentRoom].sockets;//Basically sees if the room exists. Will fail if it doesn't.
                for (var socketId in socketIdsInRoom ) {
                    users.push(io.sockets.connected[socketId].username);
                }
                //Notify previously connected users a new user connected to the room
                socket.to(socket.currentRoom).emit('userJoined', socket.username);
            } catch(e){}
            socket.join(socket.currentRoom);
            //Notify new user which users were already in the room
            callback({
                'status': 'good',
                'users': users
            });
            console.log(new Date().toLocaleTimeString() + ' | User "' + socket.username + '" has joined room "' + socket.currentRoom + '".');
        }
    });

    //A user requested to leave their current room
    socket.on('leaveRoom', function(callback){
        if(!socket.currentRoom){
            callback('User is not currently in a room.');
        } else {
            socket.to(socket.currentRoom).emit('userLeft', socket.username);
            socket.leave(socket.currentRoom);
            callback('good');
            console.log(new Date().toLocaleTimeString() + ' | User "' + socket.username + '" has left room "' + socket.currentRoom + '".');
            socket.currentRoom = '';
        }
    });

    //A user has disconnected
    socket.on('disconnect', function() {
        console.log(new Date().toLocaleTimeString() + ' | A user has disconnected. Total users: ' + io.engine.clientsCount);
    });
});