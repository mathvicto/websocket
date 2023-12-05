const express = require('express');
const app = express();
const servidor = require('http').createServer(app);
const io = require('socket.io')(servidor);

users = [];

servidor.listen(process.env.PORT || 3001);
console.log('Servidor rodando na porta 3001');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('Novo usuário conectado');

    socket.on('send message', function(data){
        console.log('Mensagem recebida no servidor:', data);
        io.emit('new message', { username: socket.username, msg: data });
        io.emit('stop typing');
    });

    socket.on('new user', function(username, callback){
        console.log('Novo usuário no servidor:', username);
        callback(true);
        socket.username = username;
        users.push(socket.username);
        updateUsernames();
    });

    socket.on('disconnect', function() {
        if(!socket.username) return;
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        console.log('Usuário desconectado');
        io.emit('stop typing');
    });

    socket.on('typing', function() {
        io.emit('typing', socket.username);
    });

    function updateUsernames(){
        io.emit('get users', users);
    }
});
