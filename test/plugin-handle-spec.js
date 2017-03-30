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
                return session.videoRoom().createVideoRoomHandle();
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
            handle.destroy({
                room: 123
            }).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should fail while destroying a none existing room', function(done) {
            handle.destroy({
                room: 123
            }).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should check whether a room exists', function(done) {
            handle.exists({
                room: 123
            }).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should list all rooms', function(done) {
            handle.list().then((res)=>{
                assert.isArray(res.list);
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should list all participants', function(done) {
            handle.listParticipants({
                room: 123
            }).then((res)=>{
                assert.isArray(res.participants);
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should join a room as publisher', function(done) {
            handle.join({
                room: 123,
                ptype: 'publisher'
            }).then((res)=>{
                assert.equal(res.response.getData().videoroom, 'joined');
                assert.equal(res.response.getData().room, 123);
                assert.isNumber(res.response.getData().id);
                assert.isArray(res.response.getData().publishers);
                done();
            }).catch((err)=>{
                done(err);
            });
        });

        it('should join a room as listener', function(done) {
            handle.join({
                room: 123,
                ptype: 'listener',
                feed: 456
            }).then((res)=>{
                assert.equal(res.response.getData().videoroom, 'attached');
                assert.equal(res.response.getData().room, 123);
                assert.isNumber(res.response.getData().id);
                assert.deepProperty(res.response.getResponse(), 'jsep.type');
                assert.deepProperty(res.response.getResponse(), 'jsep.sdp');
                done();
            }).catch((err)=>{
                done(err);
            });
        });
    });
});
