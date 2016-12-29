var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];
server.listen(process.env.PORT || 3000);
console.log('server running');


app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');

});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected %s sockets connected', connections.length);

	//disconnect
	
	socket.on('disconnect', function(data){
		console.log(socket.username, " disconnected");
		if(socket.username){
		users.splice(users.indexOf(socket.username), 1);
		}
		connections.splice(connections.indexOf(socket), 1);
		updateUsernames();

	});

	socket.on('connect again', function(data, callback){
		if(users.indexOf(data) == -1){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
		console.log(socket.username, " reconnected");
		return;
		}
		callback(false);
		

	});
	
	
	
	//new user

	socket.on('new user', function(data, callback){
		if(users.indexOf(data) != -1){
			callback(false);
			return;
		}
		
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();


	});

	//send message

	socket.on('send message', function(data){
		io.sockets.emit('new message', {msg:data.msg, user: socket.username, to:data.to});

	});

	function updateUsernames(){
		io.sockets.emit('get users', users);
		
		

	}

	
	
});

