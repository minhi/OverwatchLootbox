var http = require("http");

http.createServer(function(request, response) {
	console.log("hi");
	response.writeHead(200);
	response.write("minh");
	response.end();
}).listen(13439, "0.0.0.0");