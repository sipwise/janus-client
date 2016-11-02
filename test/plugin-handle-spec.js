'use strict';

var config = require('./config').config;
var JanusServerMock = require('../src/mock/janus-server').JanusServer;
var Client = require('../src/client').Client;
var assert = require('chai').assert;

var mockServerPort = config.janus.server.port;
var mockServerUrl = config.janus.server.url;

describe('PluginHandle', function(){

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

    var handle;
    beforeEach(function(done){
        var client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            client.createSession().then((session)=>{
                return session.createVideoRoomHandle();
            }).then((videoRoomHandle)=>{
                handle = videoRoomHandle;
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        client.connect();
    });

    it('should detach', function(done) {
        handle.detach().then(()=>{
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should hangup', function(done) {
        handle.hangup().then(()=>{
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should trickle', function(done) {
        handle.trickle().then(()=>{
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should complete trickle', function(done) {
        handle.trickleCompleted().then(()=>{
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    describe('VideoRoomHandle', function() {

        it('should create a new room', function(done){
            handle.create().then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should destroy a room', function(done) {
            handle.destroy(123).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should fail while destroying a none existing room', function(done) {
            handle.destroy(123).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should check whether a room exists', function(done) {
            handle.exists(123).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should list all rooms', function(done) {
            handle.list().then((list)=>{
                assert.isArray(list);
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should list all participants', function(done) {
            done();
        });
    });
});
