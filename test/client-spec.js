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

var brokenMockServerPort = config.janus.server.port + 1;
var brokenMockServerUrl = 'http://localhost:' + brokenMockServerPort;

var handshakeTimeoutError = 'Opening handshake has timed out';
var earlyCloseError = 'WebSocket was closed before the connection was established';


describe('Client', function() {

    var janusServerMock;
    var brokenJanusServerMock;
    before(function(done){
        janusServerMock = new JanusServerMock({
            port: mockServerPort
        });
        brokenJanusServerMock = new JanusServerMock({
            port: brokenMockServerPort,
            triggerHandshakeTimeout: true
        });
        Promise.all([
            janusServerMock.init(),
            brokenJanusServerMock.init()
        ]).then(() => done()).catch((e) => done(e));
    });

    after(function(){
        janusServerMock.close();
        brokenJanusServerMock.close();
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

    [
        {when: 'after', connectionTimeout: 200, handshakeTimeout: 300, expectedError: earlyCloseError},
        {when: 'before', connectionTimeout: 300, handshakeTimeout: 200, expectedError: handshakeTimeoutError}
    ].forEach((test) => {
        it(`does not throw uncaught exception if handshake timeout occurs ${test.when} connection timeout`, function(done) {

            var client = new Client({
                url: brokenMockServerUrl,
                reconnect: true,
                connectionTimeout: test.connectionTimeout,
                handshakeTimeout: test.handshakeTimeout,
            });
            var caughtError = false
            var isDone = false

            function onUncaughtException(err) {
                if (isDone) { return; }
                isDone = true;
                process.off('uncaughtException', onUncaughtException);
                var msg = err.message;
                done(new Error('Client should not cause uncaught exception: ' + msg));
            }

            client.onError((err) => {
                if (isDone) { return; }
                var msg = err.message;
                caughtError = msg === test.expectedError;
                if (caughtError) {
                    isDone = true;
                    process.off('uncaughtException', onUncaughtException);
                    done();
                }

            });

            process.on('uncaughtException', onUncaughtException)

            client.connect();
        });
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
