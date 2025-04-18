var express = require('express');
var Server = require('socket.io').Server;
var createServer = require('http').createServer;
var cors = require('cors');
var PORT = 8001;
var app = express();
var server = new createServer(app);
// Create the intance of io
var io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        method: ["GET", "POST"],
        credentials: true
    }
});
app.use(cors());
app.get('/', function (req, res) {
    return res.json({
        "msg": "Request on /"
    });
});
// Map to store the user id corresponding to their socket id
var userSocketMap = new Map();
io.on("connection", function (socket) {
    // Listens for new client connections to the Socket.IO server. The callback function is executed whenever a new client connects, and it's passed a socket object that represents that specific connection
    console.log("Client Added ".concat(socket.id));
    socket.on("message", function (data) {
        console.log("Data receive by the server from the client", data);
        socket.emit("message", "Hii from the server with socket.emit", data); // Only sender will see the message in the browser console
        // io.emit("message","Hii from the server with io.emit"); // All member who are connected to client can see the message in the browser console
    });
    // Room Chat
    socket.on("joinRoom", function (roomName) {
        socket.join(roomName);
        console.log("User joined room :".concat(roomName));
    });
    socket.on("sendToRoom", function (_a) {
        var room = _a.room, message = _a.message;
        console.log("Room is and message is", room, message);
        // This sends to all sockets in the room
        //  io.to(room).emit("roomMessage",message);
        socket.to(room).emit("roomMessage", message);
        socket.emit("sendmessage", message);
    });
    // Creating group for two people chat
    socket.on("creategroup", function (roomname) {
        socket.join(roomname);
        console.log("The room is created and room name is", roomname);
        // Notify the clinet that room is created
        socket.emit("group-created", "Room ".concat(roomname, " created successfully"));
    });
    socket.on("send-message", function (_a) {
        var roomname = _a.roomname, message = _a.message;
        socket.to("chatgroup").emit("newMessage", message);
    });
    // Two person chat who are in the logged in can only send and recieve message
    socket.on("register-user", function (userid) {
        userSocketMap.set(userid, socket.id);
        console.log("User ".concat(userid, " is connected with socket ").concat(socket.id));
    });
    socket.on("startconversation", function (_a) {
        var message = _a.message, chatid = _a.chatid;
        var targetid = userSocketMap.get(chatid);
        if (targetid) {
            console.log("The target id is", targetid);
            io.to(targetid).emit("newMessage", message);
        }
        else {
            console.log("User is not connected");
        }
    });
});
server.listen(PORT, function () {
    console.log("Server is running on the ".concat(PORT));
});
// Okk so if I use the socket.on on server side it will listen the message from the client side and if I use the socket.on on the client side it will listen the message from the server side condition is event name should be same in both socket.on 
// emit - This method is responsible for sending messages. socket. on - This method is responsible for listening for incoming messages.
