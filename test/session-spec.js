'use strict';

var config = require('./config').config;
var JanusServerMock = require('../src/mock/janus-server').JanusServer;
var Client = require('../src/client').Client;
var Session = require('../src/session').Session;
var VideoRoomHandle = require('../src/plugins/videoroom/handle').VideoRoomHandle;
var assert = require('chai').assert;

var mockServerPort = config.janus.server.port;
var mockServerUrl = config.janus.server.url;

describe('Session', function() {

    var janusServerMock;
    before(function(done){
        janusServerMock = new JanusServerMock({
            port: mockServerPort
        });
        janusServerMock.init().then(()=>{
            done();
        }).catch(()=>{
            done(err);
        });
    });

    after(function(){
        janusServerMock.close();
    });

    var client;
    var session;
    beforeEach(function(done){
        client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            client.createSession().then((newSession)=>{
                session = newSession;
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        client.connect();
    });

    it('should send keep alive', function(done){
        session.keepAlive().then(()=>{
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should create video room handle', function(done){
        session.videoRoom().createVideoRoomHandle().then((handle)=>{
            assert.instanceOf(handle, VideoRoomHandle);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should destroy itself', function(done){
        session.destroy().then(()=>{
            done();
        }).catch((err)=>{
            done(err);
        });
    });
});
