var net = require("net");
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require('path');

var HOST = "127.0.0.1";
var PORT = 5000;

// Array aus Usern: {username, id, socketid}
var users = [];
var userId = 0;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
	console.log('CONNECTED TO: ' + HOST + ':' + PORT);
});

// ROUTES
// Damit HTML-Dateien auch externe css bzw js Dateien laden können
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(request, response) {
	/*client.write('c');
	response.writeHead(200);
	response.write("minh");
	response.end();*/
	response.sendFile(__dirname + "/index.html");
});

http.listen(13439, "0.0.0.0", function() {
	console.log("listening on *:13439");
});

// SOCKET
io.on("connection", function(socket) {
	// Bei neuer Verbindung, schonmal die Stats anzeigen
	socket.emit("build", users);

	console.log("a user " + socket.id + " connected.");
	socket.on("msg", function(msg) {
		io.emit("msg", msg);
	});

	// Neuer User hat sich eingeloggt
	// msg: der Username vom User
	socket.on("add", function(msg) {
		// Allen Usern den neuen User ankündigen
		var newUser = {
			username: msg,
			id: userId,
			socketid: socket.id
		};
		++userId;
		users.push(newUser);
		io.emit("add", newUser);
	});

	// Ein User ist nicht mehr verbunden
	socket.on("disconnect", function(){
		var index = 0;
		// Suche den User, der entfernt werden soll.
		while (index < users.length && users[index].socketid !== socket.id) {
			++index;
		}
		if (index < users.length) {
			socket.broadcast.emit("remove", users[index]); // Den anderen Usern davon erzählen
			users.splice(index, 1); // Entfernt den User aus der Liste
		}
		console.log("a user " + socket.id + " disconnected.");
	});

});