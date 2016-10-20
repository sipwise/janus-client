'use strict';

var WebSocketMock = require('../src/mock/web-socket').WebSocketMock;
var Client = require('../src/client').Client;
var Janus = require('../src/janus').Janus;
var Session = require('../src/session').Session;
var assert = require('chai').assert;

describe('VideoRoom', function(){

    describe('Handle', function() {

        var webSocket;
        var client;
        var janus;
        var handle;

        beforeEach(function(done){
            webSocket = new WebSocketMock();
            client = new Client({
                webSocket: webSocket
            });
            janus = new Janus({
                client: client
            });
            janus.onConnected(()=>{
                janus.createSession().then((session)=>{
                    return session.createVideoRoomHandle();
                }).then((videoRoomHandle)=>{
                    handle = videoRoomHandle;
                    done();
                }).catch((err)=>{
                    done(err);
                });
            });
            janus.connect();
        });

        it('should create a new room', function(done){
            handle.create().then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });
    });
});
