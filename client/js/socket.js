/**
 * Created by Nick on 2/20/2016.
 */

var socket = io.connect('localhost:1337');

//For joining a new game room. The server adds the socket to the room in order to separate sessions.
function joinRoom(room){
    socket.emit('joinRoom', room);
    console.log('Joined room: ' + room);
}

//Leaves the current room.
function leaveRoom(){
    socket.emit('leaveRoom');
    console.log('Left room.');
}

//Pushes current client info to the server
function updateStatus(data){
    socket.emit('updateStatus', data);
}

//Event listeners

//Receives updated client info from the server
socket.on('/updateStatus', function(data){
    console.log('New status: ' + data);
});