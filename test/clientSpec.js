'use strict';

var Janus = require('../src/janus').Janus;
var WebSocketServer = require('ws').Server;
var WebServer = require('http').createServer;
var Plugins = require('../src/constants').Plugins;

var server = WebServer();
var webSocketServer = new WebSocketServer({
    server: server
});

server.listen(6000, function(){

    describe('Client', function(){

        it('should connect', function(done){
            done();
        });
    });

    run();
});
