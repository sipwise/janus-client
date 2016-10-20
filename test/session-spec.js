'use strict';

var WebSocketMock = require('../src/mock/web-socket').WebSocketMock;
var Client = require('../src/client').Client;
var Janus = require('../src/janus').Janus;
var Session = require('../src/session').Session;
var VideoRoomHandle = require('../src/plugins/videoroom/handle').VideoRoomHandle;
var assert = require('chai').assert;

describe('Session', function() {

    var webSocket;
    var client;
    var janus;
    var session;

    beforeEach(function(done){
        webSocket = new WebSocketMock();
        client = new Client({
            webSocket: webSocket
        });
        janus = new Janus({
            client: client
        });
        janus.onConnected(()=>{
            janus.createSession().then((newSession)=>{
                session = newSession;
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        janus.connect();
    });

    it('should send keep alive', function(done){
        session.keepAlive().then(()=>{
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should create video room handle', function(done){
        session.createVideoRoomHandle().then((handle)=>{
            assert.instanceOf(handle, VideoRoomHandle);
            done();
        }).catch((err)=>{
            done(err);
        });
    });
});
