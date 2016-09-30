'use strict';

var _ = require('lodash');
var WebSocket = require('ws');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var Transaction = require('./transaction').Transaction;
var logger = require('debug-logger')('janus:client');

var ConnectionState = {
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED'
};

var ClientEvent = {
    connected: 'connected',
    disconnected: 'disconnected',
    object: 'object',
    error: 'error',
    timeout: 'timeout'
};

var WebSocketEvent = {
    open: 'open',
    message: 'message',
    error: 'error',
    close: 'close'
};

/**
 * @class
 */
class ClientResponse {

    constructor(req, res) {
        this.request = req;
        this.response = res;
    }

    getRequest() {
        return this.request;
    }

    getResponse() {
        return this.response;
    }

    getType() {
        return _.get(this.response, 'janus', null);
    }

    isError() {
        return this.getType() === 'error';
    }

    isAck() {
        return this.getType() === 'ack';
    }

    isSuccess() {
        return this.getType() === 'success';
    }
}

/**
 * @class
 */
class Client {

    constructor(options) {
        options = options || {};
        this.url = options.url || 'ws://localhost:8188';
        this.logger = options.logger || logger || console;
        this.requestTimeout = options.requestTimeout || 6000;
        this.protocol = 'janus-protocol';
        this.webSocket = null;
        this.connectionState = ConnectionState.DISCONNECTED;
        this.emitter = new EventEmitter();
        this.transactions = {};
        this.timeoutTimer = null;
        this.timeout = options.timeout || 60000;
    }

    startTimeout() {
        this.stopTimeout();
        this.timeoutTimer = setTimeout(()=>{
            this.emitter.emit(ClientEvent.timeout);
        }, this.timeout);
    }

    stopTimeout() {
        if(this.timeoutTimer !== null) {
            clearTimeout(this.timeoutTimer);
        }
    }

    connect() {
        this.webSocket = new WebSocket(this.url, this.protocol);
        this.webSocket.on(WebSocketEvent.open, ()=>{
            this.webSocketOpen();
        });
        this.webSocket.on(WebSocketEvent.close, ()=>{
            this.webSocketClose();
        });
        this.webSocket.on(WebSocketEvent.message, (message)=>{
            this.webSocketMessage(message);
        });
        this.webSocket.on(WebSocketEvent.error, (err)=>{
            this.webSocketError(err);
        });
    }

    webSocketOpen() {
        this.setConnectionState(ConnectionState.CONNECTED);
    }

    webSocketClose() {
        this.setConnectionState(ConnectionState.DISCONNECTED);
    }

    webSocketMessage(message) {

        this.startTimeout();

        var obj;
        try {
            obj = JSON.parse(message);
            this.logger.debug('Received message', obj);
            this.dispatchObject(obj);
        } catch(err) {
            this.emitter.emit(ClientEvent.error, err);
        }
    }

    webSocketError(err) {
        this.emitter.emit(ClientEvent.error, err);
    }

    setConnectionState(state) {
        var hasState = this.connectionState === state;
        if(!hasState) {
            switch(state) {
                case ConnectionState.CONNECTED:
                case ConnectionState.DISCONNECTED:
                    this.connectionState = state;
                    this.emitter.emit(state.toLowerCase());
                    break;
                default:
                    throw new Error('Invalid state ' + state);
            }
        }
    }

    on(type, listener) {
        this.emitter.on(type, listener);
    }

    off(type, listener) {
        this.emitter.removeListener(type, listener);
    }

    dispatchObject(obj) {
        if(_.isString(obj.transaction) && this.transactions[obj.transaction] instanceof Transaction) {
            var transaction = this.transactions[obj.transaction];
            var response = new ClientResponse(transaction.getRequest(), obj);
            transaction.response(response);
        } else {
            this.emitter.emit(ClientEvent.object, obj);
        }
    }

    sendObject(obj) {
        return new Promise((resolve, reject)=>{
            this.webSocket.send(JSON.stringify(obj), (err)=>{
                if(_.isObject(err)) {
                    reject(err);
                } else {
                    this.logger.debug('Sent message', obj);
                    resolve();
                }
            });
        });
    }

    transact(req) {
        var transaction = new Transaction(req, (finalReq)=>{
            this.sendObject(finalReq).then(()=>{

            }).catch((err)=>{
                transaction.error(err);
            });
        });
        this.transactions[transaction.getId()] = transaction;
        transaction.onEnd(()=>{
            delete this.transactions[transaction.getId()];
        });
        return transaction;
    }

    request(req, options) {
        return new Promise((resolve, reject)=>{
            var options = options || {};
            var requestTimeout = options.requestTimeout || this.requestTimeout;
            var transaction = this.transact(req).onAck((res)=>{
                transaction.end();
                resolve(res);
            }).onResponse((res)=>{
                transaction.end();
                resolve(res);
            }).onError(function(err){
                transaction.offError(this.constructor);
                reject(err);
            }).timeout(requestTimeout).start();
        });
    }
}

exports.Client = Client;
exports.ClientEvent = ClientEvent;
exports.ConnectionState = ConnectionState;
exports.WebSocketEvent = WebSocketEvent;
exports.ClientResponse = ClientResponse;
