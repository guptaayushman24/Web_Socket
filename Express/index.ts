const express = require('express');
const {Server} = require('socket.io');
const {createServer} = require('http');
const cors = require('cors');
const PORT = 8001;

const app = express();
const server = new createServer(app);

// Create the intance of io
const io = new Server(server,{
    cors:{
        origin:'http://localhost:3000',
        method:["GET","POST"],
        credentials:true
    }
})

app.use(cors());
app.get('/',(req:any,res:any)=>{
    return res.json({
        "msg":"Request on /"
    })
})
// Map to store the user id corresponding to their socket id
let userSocketMap = new Map<number,string>();
io.on("connection",(socket:any)=>{
     // Listens for new client connections to the Socket.IO server. The callback function is executed whenever a new client connects, and it's passed a socket object that represents that specific connection
     console.log(`Client Added ${socket.id}`)

     socket.on("message",(data:any)=>{
        console.log("Data receive by the server from the client",data);
        socket.emit("message","Hii from the server with socket.emit",data); // Only sender will see the message in the browser console
        // io.emit("message","Hii from the server with io.emit"); // All member who are connected to client can see the message in the browser console
 
        })

        // Room Chat
        socket.on("joinRoom",(roomName:any)=>{
            socket.join(roomName);
            console.log(`User joined room :${roomName}`)
        })

     
        socket.on("sendToRoom",({room,message})=>{
            console.log("Room is and message is",room,message);
             // This sends to all sockets in the room
            //  io.to(room).emit("roomMessage",message);
            socket.to(room).emit("roomMessage",message);
            socket.emit("sendmessage",message);
        });

          // Creating group for two people chat
           socket.on("creategroup",(roomname)=>{
            socket.join(roomname);
            console.log("The room is created and room name is",roomname);

            // Notify the clinet that room is created
            socket.emit("group-created", `Room ${roomname} created successfully`);
        })

        socket.on("send-message",({roomname,message})=>{
            socket.to("chatgroup").emit("newMessage",message);
        })   

        // Two person chat who are in the logged in can only send and recieve message
        socket.on("register-user",(userid)=>{
            userSocketMap.set(userid,socket.id);
            console.log(`User ${userid} is connected with socket ${socket.id}`);
        })

        socket.on("startconversation",({message,chatid})=>{
            const targetid = userSocketMap.get(chatid);
            if (targetid){
                console.log("The target id is",targetid);
                io.to(targetid).emit("newMessage", message);
            }
            else{
                console.log("User is not connected");
            }
        })
     })

   

server.listen(PORT,()=>{
    console.log(`Server is running on the ${PORT}`);
})


// Okk so if I use the socket.on on server side it will listen the message from the client side and if I use the socket.on on the client side it will listen the message from the server side condition is event name should be same in both socket.on 
// emit - This method is responsible for sending messages. socket. on - This method is responsible for listening for incoming messages.

