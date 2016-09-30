'use strict';

var _ = require('lodash');
var createId = require('uuid');
var EventEmitter = require('events').EventEmitter;
var ResponseError = require('./errors').ResponseError;

var State = {
    new: 'new',
    started: 'started',
    ended: 'ended'
};

var Event = {
    response: 'response',
    end: 'end',
    error: 'error'
};

/**
 * @class
 */
class InvalidTransactionState {

    constructor(transaction) {
        this.name = this.constructor.name;
        this.message = 'Invalid transaction state';
        this.transaction = transaction;
        this.state = transaction.getState();
    }
}

/**
 * @class
 */
class TransactionTimeoutError {

    constructor(transaction, timeout) {
        this.name = this.constructor.name;
        this.message = 'Transaction timeout';
        this.transaction = transaction;
        this.timeout = timeout;
    }
}

/**
 * @class
 */
class Transaction {

    constructor(request, handler) {
        this.id = createId();
        this.request = request;
        this.request.transaction = this.id;
        this.emitter = new EventEmitter();
        this.handler = handler;
        this.state = State.new;
        this.timeoutTimer = null;
        this.timeoutMilli = 6000;
        this.useTimeout = false;
        this.acknowledged = false;
    }

    getId() {
        return this.id;
    }

    getRequest() {
        return this.request;
    }

    getState() {
        return this.state;
    }

    start() {
        if(this.state === State.new) {
            this.state = State.started;
            this.startTimeout();
            this.handler(this.getRequest());
        } else {
            throw new InvalidTransactionState(this);
        }
        return this;
    }

    response(res) {
        if(this.state === State.started) {
            this.startTimeout();
            if(res.isError()) {
                this.error(new ResponseError(res.getRequest(), res));
            } else if(res.isAck()) {
                this.acknowledged = true;
                this.emitter.emit('ack');
            } else {
                this.emitter.emit(Event.response, res);
            }
        } else {
            throw new InvalidTransactionState(this);
        }
    }

    end() {
        if(this.state !== State.ended) {
            this.state = State.ended;
            this.stopTimeout();
            this.emitter.emit(Event.end);
        } else {
            throw new InvalidTransactionState(this);
        }
    }

    error(err) {
        this.end();
        this.emitter.emit(Event.error, err);
    }

    onAck(listener) {
        this.emitter.on('ack', listener);
        return this;
    }

    onResponse(listener) {
        this.emitter.on(Event.response, listener);
        return this;
    }

    offResponse(listener) {
        this.emitter.removeListener(Event.response, listener);
        return this;
    }

    onEnd(listener) {
        this.emitter.on(Event.end, listener);
        return this;
    }

    offEnd(listener) {
        this.emitter.removeListener(Event.end, listener);
        return this;
    }

    onError(listener) {
        this.emitter.on(Event.error, listener);
        return this;
    }

    offError(listener) {
        this.emitter.removeListener(Event.error, listener);
        return this;
    }

    timeout(timeout) {
        if(this.state === State.new) {
            this.useTimeout = true;
            this.timeoutMilli = timeout;
        } else {
            throw new InvalidTransactionState(this);
        }
        return this;
    }

    startTimeout() {
        if(this.useTimeout) {
            this.stopTimeout();
            this.timeoutTimer = setTimeout(()=> {
                this.error(new TransactionTimeoutError(this, this.timeoutMilli));
            }, this.timeoutMilli);
        }
    }

    stopTimeout() {
        if(this.timeoutTimer !== null) {
            clearTimeout(this.timeoutTimer);
        }
    }

    isAcknowledged() {
        return this.acknowledged;
    }
}

exports.Transaction = Transaction;
