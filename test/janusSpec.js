'use strict';

var WebSocketMock = require('../src/mock/web-socket').WebSocketMock;
var Client = require('../src/client').Client;
var ConnectionState = require('../src/janus').ConnectionState;
var Janus = require('../src/janus').Janus;
var assert = require('chai').assert;
var Session = require('../src/session').Session;

describe('Janus', function() {

    var webSocket;
    var client;
    var janus;

    beforeEach(function(){
        webSocket = new WebSocketMock();
        client = new Client({
            webSocket: webSocket
        });
        janus = new Janus({
            client: client
        });
    });

    it('should fire an error event', function(done){
        janus.onError((err)=>{
            assert.instanceOf(err, Error);
            done();
        });
        janus.triggerError(new Error());
    });

    it('should connect and fire connected event', function(done){
        janus.onError((err)=>{
            done(err);
        });
        janus.onConnected(()=>{
            done();
        });
        janus.connect();
    });

    it('should return the version of janus', function(done){
        janus.onError((err)=>{
            done(err);
        });
        janus.onConnected(()=>{
            assert.isString(janus.getVersion());
            assert.notEqual(janus.getVersion(), '');
            done();
        });
        janus.connect();
    });

    it('should return the current connection state', function(done){
        assert.equal(janus.getConnectionState(), ConnectionState.DISCONNECTED);
        janus.onError((err)=>{
            done(err);
        });
        janus.onConnected(()=>{
            assert.equal(janus.getConnectionState(), ConnectionState.CONNECTED);
            done();
        });
        janus.connect();
    });

    it('should return whether the connection is connected or not', function(done){
        assert.equal(janus.isConnected(), false);
        janus.onError((err)=>{
            done(err);
        });
        janus.onConnected(()=>{
            assert.equal(janus.isConnected(), true);
            done();
        });
        janus.connect();
    });

    it('should fetch info about janus server', function(done){
        janus.onError((err)=>{
            done(err);
        });
        janus.onConnected(()=>{
            janus.getInfo().then(()=>{
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        janus.connect();
    });

    it('should create a new session', function(done){
        janus.onError((err)=>{
            done(err);
        });
        janus.onConnected(()=>{
            janus.createSession().then((session)=>{
                assert.instanceOf(session, Session);
                done();
            }).catch(()=>{
                done(err);
            });
        });
        janus.connect();
    });

    it('should destroy session by id', function(done){
        janus.onError((err)=>{
            done(err);
        });
        janus.onConnected(()=>{
            janus.destroySession(123).then(()=>{
                done();
            }).catch(()=>{
                done(err);
            });
        });
        janus.connect();
    });

    it('should delete session locally', function(done){
        janus.onError((err)=>{
            done(err);
        });
        janus.onConnected(()=>{
            janus.createSession().then((session)=>{
                janus.deleteSession(session.getId());
                done();
            }).catch(()=>{
                done(err);
            });
        });
        janus.connect();
    });
});
