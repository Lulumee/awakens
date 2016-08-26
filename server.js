var request = require('request');
var _ = require('underscore');
var $ = require('jquery-deferred');
var express = require('express');
var fs = require('fs');

var channels = {};

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err);
});

function createChannel(io, channelName){
    
    console.log('Starting channel', channelName);
    
    var room = io.of(channelName);
        
    var channel = {
        online : [],
        status : 'public'
    };
        
    room.on('connection', function(socket){
        
        var user = {
            remote_addr : socket.request.connection.remoteAddress,
            socket : socket,
            role : 3
        };
        
        
        
        socket.on('message', function (message) {
            
            socket.emit('message', {
                message : message,
                messageType : 'chat',
                nick : 'sammich'
            });
            
        });
        
        
        function attemptJoin (){
            
            console.log(user.remote_addr)
            channel.online.push(user);
            
        }
        
        socket.on('requestJoin', attemptJoin);
        
        socket.on('disconnect', function(){
            
        });
        
    });
        
    return true;
}

function intoapp(app, http){
    var channelRegex = /^\/(\w*\/?)$/;
    var io = require('socket.io')(http);
    app.use(express.static(__dirname + '/public'));
    app.get(channelRegex, function(req, res){
        if(!channels[req.url]){
            channels[req.url] = createChannel(io, req.url);
        }
        var index = fs.readFileSync('index.html').toString();
        res.send(index);
    });
}

(function(){
    var app = express();
    var http = require('http').Server(app);
    http.listen(80, function(){
       console.log('listening on *:80');
       intoapp(app, http);
    });
})();