'use strict';

var Transaction = require('../src/transaction').Transaction;
var TransactionTimeoutError = require('../src/transaction').TransactionTimeoutError;
var ClientResponse = require('../src/client/response').ClientResponse;
var assert = require('chai').assert;
var validator = require('validator');

var request = {
    request: 'foo'
};

var defaultHandler = function() {
    console.log('Handler called');
};

describe('Transaction', function(){

    it('should create a random transaction id', function(){
        var transaction = new Transaction(request, defaultHandler);
        assert.deepEqual(validator.isUUID(transaction.getId()), true);
    });

    it('should add id to request object', function(){
        var transaction = new Transaction(request, defaultHandler);
        assert.property(transaction.getRequest(), 'transaction');
        assert.equal(transaction.getRequest().transaction, transaction.getId());
    });

    it('should has initial state of new', function(){
        var transaction = new Transaction(request, defaultHandler);
        assert.equal(transaction.getState(), 'new');
    });

    it('should start and call the main handler', function(done){
        var transaction = new Transaction(request, function(request){
            assert.deepEqual(request, transaction.getRequest());
            done();
        });
        transaction.start();
    });

    it('should throw timeout error after no response', function(done){

        var timeout = 500;
        var transaction = new Transaction(request, function(request){
            assert.deepEqual(request, transaction.getRequest());
        });
        this.timeout(timeout + 500);
        transaction.onError(function(err){
            assert.instanceOf(err, TransactionTimeoutError);
            done();
        });
        transaction.timeout(timeout).start();
    });

    it('should receive a single response', function(done){

        var clientResponse = null;
        var timeout = 3000;
        var transaction = new Transaction(request, function(request){
            assert.deepEqual(request, transaction.getRequest());
            clientResponse = new ClientResponse(request, {
                transaction: transaction.getId()
            });
            transaction.response(clientResponse);
        });
        this.timeout(timeout + 500);
        transaction.onResponse(function(response){
            //assert.deepEqual(clientResponse, response);
            done();
        });
        transaction.timeout(timeout).start();
    });
});
