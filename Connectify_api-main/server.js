const express = require('express');
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const {notFound,errorHandler} = require("./middleware/errorMiddleware");
const cors = require("cors");
const path = require("path");

dotenv.config()
connectDB()
const app = express()
app.use(cors());

app.use(express.json());

app.get('/',(req,res)=>{
    res.setHeader("Access-Control-Allow-Credentials","true");
    res.send("API is running");
});


app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);


// deployment...


//delployment....





app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT

const server=app.listen(5000,console.log(`Server Started on PORT ${PORT}`));



const io = require('socket.io')(server,{
    pingTimeout:6000,
    cors:{
        origin: "https://s-connectify.onrender.com",
    },
});

io.on("connection",(socket)=>{
    console.log("connected to socket.io");

    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected");
    });
    socket.on('join chat',(room)=>{
        socket.join(room);
        console.log("user joined room:"+ room)
    });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
    
        if (!chat.users) return console.log("chat.users not defined");
    
        chat.users.forEach((user) => {
          if (user._id == newMessageRecieved.sender._id) return;
    
          socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
      });


   
})
