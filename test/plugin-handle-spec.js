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

    describe('VideoRoomHandle', function() {


    });
});
