/**
 * Created by Nick on 2/20/2016.
 */

var socket = io.connect('noobnoob.no-ip.org:1337');

//Pushes current client info to the server
function updateStatus(data){
    socket.emit('updateClientStatus', data);
}

//For joining a new game room. The server adds the socket to the room in order to separate sessions.
function joinRoom(room){
    socket.emit('joinRoom', room, function(response){
        if(response.status === 'good'){
            // TODO add more shtuff into this data block more than just name
            var users = response.users;
            users.forEach(function(user){
                players.push(Player(50, 50, user, 'rgb(255,150,190)'));
            });
            trash = response.trash.slice();
            console.log('Successfully joined room "' + room + '". Previous users: ' + response.users);

        } else {
            console.error('Error joining room. Reason: ' + response);
        }
    });
}

function setUsername(data){
    socket.emit('setUsername', data, function(response){
        if(response === 'good'){
            ship.name = data;
            console.log('Username successfully set.');
        } else {
            console.error('Error setting username. Reason: ' + response);
        }
    });
}

//Leaves the current room.
function leaveRoom(){
    socket.emit('leaveRoom', function(response){
        if(response === 'good'){
            trash = [];
            //ship = null;
            players = [];
            ship.trash = 0;
            console.log('Successfully left room.')
        } else{
            console.error('Error leaving room. Reason: ' + response);
        }
    });
}
