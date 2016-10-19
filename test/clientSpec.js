'use strict';

var Transaction = require('../src/transaction').Transaction;
var Client = require('../src/client').Client;
var WebSocketMock = require('../src/mock/ws').WebSocketMock;
var assert = require('chai').assert;

describe('Client', function() {

    it('should connect the client', function(done){

        var webSocket = new WebSocketMock();
        var client = new Client({
            webSocket: webSocket
        });
        client.on('connected',()=>{
            done();
        });
        client.connect();
    });

    it('should send and receive an object', function(done){

        var obj = {
            foo: 'bar'
        };
        var webSocket = new WebSocketMock();
        var client = new Client({
            webSocket: webSocket
        });
        client.on('connected',()=>{
            client.sendObject(obj);
        });
        client.on('object', (receivedObj)=>{
            assert.deepEqual(obj, receivedObj);
            done();
        });
        client.connect();
    });

    it('should create a transaction', function(done){

        var webSocket = new WebSocketMock();
        var client = new Client({
            webSocket: webSocket
        });
        var transaction = client.transact({
            request: 'foo'
        });
        assert.instanceOf(transaction, Transaction);
        done();
    });

    it('should create a request', function(done){

        var webSocket = new WebSocketMock();
        var client = new Client({
            webSocket: webSocket
        });

        client.on('connected',()=>{
            client.request({
                request: 'foo'
            }).then((res)=>{
                assert(res.getRequest(), res.getResponse());
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        client.connect();
    });
});
