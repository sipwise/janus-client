'use strict';

var Transaction = require('../src/transaction').Transaction;
var TransactionState = require('../src/transaction').TransactionState;
var TransactionTimeoutError = require('../src/transaction').TransactionTimeoutError;
var InvalidTransactionState = require('../src/transaction').InvalidTransactionState;
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
            assert.equal(transaction.getState(), TransactionState.started);
            transaction.response(new ClientResponse(request, response));
        }).onResponse((res)=>{
            assert.equal(transaction.getState(), TransactionState.receiving);
            assert.deepEqual(res.getResponse(), response);
        }).onEnd(()=>{
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
            assert.equal(transaction.getState(), TransactionState.ended);
            assert.instanceOf(err, TransactionTimeoutError);
        }).onEnd(()=>{
            assert.equal(transaction.getState(), TransactionState.ended);
            done();
        }).start();
    });

    it('should receive ack and response', function(done){

        var hasAck = false;
        var transaction = new Transaction({
            request: request,
            client: clientMock,
            ack: true
        });
        var response = {
            janus: 'success',
            transaction: transaction.getId()
        };
        var ack = {
            janus: 'ack',
            transaction: transaction.getId()
        };
        transaction.onSent(()=>{
            assert.equal(transaction.getState(), TransactionState.started);
            transaction.response(new ClientResponse(request, ack));
            transaction.response(new ClientResponse(request, response));
        }).onAck(()=>{
            assert.equal(transaction.getState(), TransactionState.receiving);
            hasAck = true;
        }).onResponse((res)=>{
            assert.equal(transaction.getState(), TransactionState.receiving);
            assert.deepEqual(res.getResponse(), response);
            assert.isTrue(hasAck);
        }).onEnd(()=>{
            done();
        }).start();
    });

    it('should receive response and late ack  ', function(done){

        var hasResponse = true;
        var transaction = new Transaction({
            request: request,
            client: clientMock,
            ack: true
        });
        var response = {
            janus: 'success',
            transaction: transaction.getId()
        };
        var ack = {
            janus: 'ack',
            transaction: transaction.getId()
        };
        transaction.onSent(()=>{
            assert.equal(transaction.getState(), TransactionState.started);
            transaction.response(new ClientResponse(request, response));
            transaction.response(new ClientResponse(request, ack));
        }).onAck(()=>{
            assert.equal(transaction.getState(), TransactionState.receiving);
            assert.isTrue(hasResponse);
        }).onResponse((res)=>{
            assert.equal(transaction.getState(), TransactionState.receiving);
            hasResponse = true;
            assert.deepEqual(res.getResponse(), response);
        }).onEnd(()=>{
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
            assert.equal(transaction.getState(), TransactionState.started);
            transaction.response(new ClientResponse(request, response));
        }).onAck(()=>{
            assert.equal(transaction.getState(), TransactionState.receiving);
            ack = true;
        }).onError(function(err){
            assert.equal(transaction.getState(), TransactionState.ended);
            assert.instanceOf(err, TransactionTimeoutError);
            assert.isTrue(ack);
            done();
        }).start();
    });

    it('should throw an error, due to multiple calls of start', function(done){
        var transaction = new Transaction({
            request: request,
            client: clientMock
        });
        transaction.onSent(()=>{
        }).start();
        transaction.onError((err)=>{
            assert.instanceOf(err, InvalidTransactionState);
            done();
        }).onSent(()=>{
        }).start();
    });

    it('should throw an error, due to invalid call of response', function(done){
        var transaction = new Transaction({
            request: request,
            client: clientMock
        });
        transaction.onError((err)=>{
            assert.instanceOf(err, InvalidTransactionState);
            done();
        });
        transaction.response(new ClientResponse(request, request));
    });
});
