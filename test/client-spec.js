'use strict';

var config = require('./config').config;
var JanusServerMock = require('../src/mock/janus-server').JanusServer;
var Client = require('../src/client').Client;
var ConnectionState = require('../src/client').ConnectionState;
var ConnectionStateError = require('../src/client').ConnectionStateError;
var Session = require('../src/session').Session;
var assert = require('chai').assert;

var request = {
    janus: 'info'
};

var mockServerPort = config.janus.server.port;
var mockServerUrl = config.janus.server.url;

describe('Client', function() {

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

    it('should connect to websocket endpoint', function(done) {
        var client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            assert.isString(client.getVersion());
            assert.notEqual(client.getVersion(), '');
            assert.equal(client.isConnected(), true);
            assert.equal(client.getConnectionState(), ConnectionState.connected);
            done();
        });
        client.onError((err)=>{
            done(err);
        });
        client.connect();
    });

    it('should disconnect gracefully', function(done) {
        var client = new Client({
            url: mockServerUrl,
            reconnect: false
        });
        client.onConnected(()=>{
            client.disconnect();
        });
        client.onDisconnected(()=>{
            assert.equal(client.isConnected(), false);
            assert.equal(client.getConnectionState(), ConnectionState.disconnected);
            done();
        });
        client.connect();
    });

    it('should connect and timeout', function(done) {
        var client = new Client({
            url: mockServerUrl,
            reconnect: false
        });
        client.onConnected(()=>{
            client.setConnectionTimeout(100);
        });
        client.onDisconnected(()=>{
            done();
        });
        client.connect();
    });

    it('should reconnect after timeout', function(done) {
        var connects = 0;
        var finished = false;
        var client = new Client({
            url: mockServerUrl,
            reconnect: true,
            connectionTimeout: 100
        });
        client.onConnected(()=>{
            connects++;
            finished = connects === 2;
            if(finished) {
                client.disconnect();
            }
        });
        client.onDisconnected(()=>{
            if(finished) {
                done();
            }
        });
        client.connect();
    });

    it('should fail sending an object, because client is disconnected', function(done){
        var client = new Client({
            url: mockServerUrl
        });
        client.sendObject(request).then(()=>{
            done(new Error());
        }).catch((err)=>{
            assert.equal(client.isConnected(), false);
            assert.equal(client.getConnectionState(), ConnectionState.disconnected);
            assert.instanceOf(err, ConnectionStateError);
            done();
        });
    });

    it('should send an object', function(done){
        var client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            client.sendObject(request).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        client.connect();
    });

    it('should create new transaction', function(done){
        var client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            client.createTransaction({
                request: {
                    janus: 'create'
                },
                client: client,
                ack: false
            }).onResponse((res)=>{
                assert.equal(res.isSuccess(), true);
                done();
            }).start();
        });
        client.connect();
    });

    it('should do a request', function(done){
        var client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            client.request({
                janus: 'info'
            }).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        client.connect();
    });

    it('should fetch info from janus', function(done){
        var client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            client.getInfo().then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        client.connect();
    });

    it('should create new session', function(done){
        var client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            client.createSession().then((session)=>{
                assert.instanceOf(session, Session);
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        client.connect();
    });

    it('should destroy session', function(done){
        var client = new Client({
            url: mockServerUrl
        });
        client.onConnected(()=>{
            client.destroySession(1424579626).then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        client.connect();
    });
});
