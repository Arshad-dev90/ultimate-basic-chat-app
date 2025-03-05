const express = require('express')
const http = require('http')
const { set } = require('mongoose')
const socketio = require('socket.io')

const app = express()

const server = http.createServer(app)

//initialising socket 
const io = socketio(server)

app.use(express.static('public'))

const users = new Set();

io.on('connection', (socket) => {
    console.log("user is now connected")

    //handle users when they join the chat 
    socket.on('join', (username) => {
        users.add(username)
        socket.username = username;

        //broadcast to all users that a new user has joined the chat
        io.emit('user-joined', username)

        //sending the list of users to the client
        io.emit('user-list', Array.from(users));

    })



    //handle incoming chat message 
    socket.on('chat-message', (data) => {

        //broadcast to all users that a new message has been sent
        io.emit('chat-message', data)
    })


    //handle user disconnection
    socket.on('disconnect', ()=> {
        console.log("user is disconnected")

        //broadcast to all users that a user has left the chat
        users.forEach((user) => {
            if(user === socket.username){
            users.delete(user)
            io.emit('user-left', user)
            io.emit('user-list', Array.from(users));
            }
            
        })
    })

})


server.listen(3000, () => {
    console.log("listening on port 3000")
})