'use strict';

var Transaction = require('../src/transaction').Transaction;
var TransactionTimeoutError = require('../src/transaction').TransactionTimeoutError;
var ClientResponse = require('../src/client/response').ClientResponse;
var assert = require('chai').assert;
var validator = require('validator');

var request = {
    janus: 'foo'
};

var clientMock = {
    sendObject: function sendObject(obj) {
        return new Promise((resolve, reject)=>{
            resolve();
        });
    }
};

describe('Transaction', function(){

    it('should create a random transaction id', function(){
        var transaction = new Transaction({
            request: request,
            client: clientMock
        });
        assert.deepEqual(validator.isUUID(transaction.getId()), true);
    });

    it('should add id to request object', function(){
        var transaction = new Transaction({
            request: request,
            client: clientMock
        });
        assert.property(transaction.getRequest(), 'transaction');
        assert.equal(transaction.getRequest().transaction, transaction.getId());
    });

    it('should has initial state of new', function(){
        var transaction = new Transaction({
            request: request,
            client: clientMock
        });
        assert.equal(transaction.getState(), 'new');
    });

    it('should start and send the object', function(done){
        var transaction = new Transaction({
            request: request,
            client: clientMock
        });
        transaction.onSent(()=>{
            done();
        }).start();
    });

    it('should receive response', function(done){

        var transaction = new Transaction({
            request: request,
            client: clientMock
        });
        var response = {
            janus: 'success',
            transaction: transaction.getId()
        };
        transaction.onSent(()=>{
            transaction.response(new ClientResponse(request, response));
        }).onResponse((res)=>{
            assert.equal(transaction.getState(), 'ended');
            assert.deepEqual(res.getResponse(), response);
            done();
        }).start();
    });

    it('should receive nothing and timeout', function(done){

        var timeout = 500;
        var transaction = new Transaction({
            request: request,
            client: clientMock,
            timeout: timeout
        });
        this.timeout(timeout + 500);
        transaction.onError(function(err){
            assert.equal(transaction.getState(), 'ended');
            assert.instanceOf(err, TransactionTimeoutError);
            done();
        }).start();
    });

    it('should receive ack and response', function(done){

        var ack = true;
        var transaction = new Transaction({
            request: request,
            client: clientMock,
            ack: true
        });
        var response = {
            janus: 'success',
            transaction: transaction.getId()
        };
        transaction.onSent(()=>{
            transaction.response(new ClientResponse(request, response));
        }).onAck(()=>{
            ack = true;
        }).onResponse((res)=>{
            assert.equal(transaction.getState(), 'ended');
            assert.deepEqual(res.getResponse(), response);
            assert.isTrue(ack);
            done();
        }).start();
    });

    it('should receive ack and timeout', function(done){

        var ack = false;
        var timeout = 500;
        this.timeout(timeout + 500);

        var transaction = new Transaction({
            request: request,
            client: clientMock,
            timeout: timeout,
            ack: true
        });
        var response = {
            janus: 'ack',
            transaction: transaction.getId()
        };
        transaction.onSent(()=>{
            transaction.response(new ClientResponse(request, response));
        }).onAck(()=>{
            ack = true;
        }).onError(function(err){
            assert.equal(transaction.getState(), 'ended');
            assert.instanceOf(err, TransactionTimeoutError);
            assert.isTrue(ack);
            done();
        }).start();
    });
});
