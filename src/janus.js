'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var client = require('./client');
var Client = client.Client;
var ClientConnectionState = client.ConnectionState;
var ClientEvent = client.ClientEvent;
var EventEmitter = require('events').EventEmitter;
var Session = require('./session').Session;
var ResponseError = require('./errors').ResponseError;
var logger = require('debug-logger')('janus');

var ConnectionState = ClientConnectionState;

/**
 * @class
 */
class Janus {

    constructor(options) {

        options = options || {};
        this.url = options.url;
        this.logger = options.logger || logger || console;
        this.client = options.client || new Client({
                url: this.url
            });
        this.client.on(ClientEvent.connected, ()=> {
            this.clientConnected();
        });
        this.client.on(ClientEvent.disconnected, ()=> {
            this.clientDisconnected();
        });
        this.client.on(ClientEvent.object, (obj)=> {
            this.clientObject(obj);
        });
        this.client.on(ClientEvent.error, (err)=> {
            this.clientError(err);
        });
        this.hasInfo = false;
        this.info = {
            version_string: null,
            plugins: {}
        };
        this.emitter = new EventEmitter();
        this.sessions = {};
        this.connectionState = this.getConnectionState();
    }

    getConnectionState() {
        return this.client.getConnectionState();
    }

    clientConnected() {
        this.connectionState = this.client.getConnectionState();
        this.getInfo().then((res)=>{
            this.info = res.response;
            this.emitter.emit('connected');
        }).catch((err)=>{
            this.emitter.emit('error', err);
        });
    }

    clientDisconnected() {
        this.connectionState = this.client.getConnectionState();
    }

    clientObject(obj) {
        if(obj.session_id && this.hasSession(obj.session_id)) {
            this.sessions[obj.session_id].emitEvent(obj);
        } else if(obj.janus === 'timeout' && this.hasSession(obj.session_id)) {
            this.deleteSession(obj.session_id);
        } else if(obj.janus === 'timeout') {
            logger.info('Dropped session timeout event');
        } else {
            this.emitter.emit('event', obj);
        }
    }

    clientError(err) {
        this.clientDisconnected();
        this.emitter.emit('error', err);
    }

    connect() {
        if(this.getConnectionState() === ConnectionState.DISCONNECTED) {
            this.client.connect();
        }
    }

    createSession() {
        return new Promise((resolve, reject)=>{
            this.client.request({ janus: 'create' }).then((res)=>{
                if(res.isSuccess()) {
                    var session = new Session(res.getResponse().data.id, this);
                    this.sessions[session.getId()] = session;
                    this.logger.info('Created session=%s',session.getId());
                    session.onKeepAlive((result)=>{
                        if(result) {
                            this.logger.debug('KeepAlive session=%s', session.getId());
                        } else {
                            this.logger.warn('KeepAlive failed session=%s', session.getId());
                        }
                    });
                    session.onTimeout(()=>{
                        this.logger.info('Timeout session=%s',session.getId());
                        this.deleteSession(session.getId());
                    });
                    resolve(session);
                } else {
                    reject(new ResponseError(res.getRequest(), res));
                }
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    destroySession(id) {
        return new Promise((resolve, reject)=>{
            this.client.request({ janus: 'destroy' }).then((res)=>{
                if(res.isSuccess()) {
                    this.deleteSession(id);
                    resolve();
                } else {
                    reject(new ResponseError(res.getRequest(), res));
                }
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    hasSession(id) {
        return this.sessions[id] instanceof Session;
    }

    deleteSession(id) {
        delete this.sessions[id];
        this.logger.info('Deleted session=%s', id);
        this.logger.info('Sessions count=%s', Object.keys(this.sessions).length);
    }

    getInfo() {
        return new Promise((resolve, reject)=>{
            this.client.request({ janus: 'info' }).then((res)=>{
                if(res.getType() === 'server_info') {
                    this.hasInfo = true;
                    resolve(res);
                } else {
                    reject(new ResponseError(res.getRequest(), res));
                }
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    getVersion() {
        return (this.hasInfo)? this.info.version_string : '';
    }

    transact() {
        return this.client.transact.apply(this.client, arguments);
    }

    request() {
        return this.client.request.apply(this.client, arguments);
    }

    isConnected() {
        return this.getConnectionState() === ConnectionState.CONNECTED;
    }

    triggerError(err) {
        this.emitter.emit('error', err);
    }

    onConnected(listener) {
        this.emitter.on('connected', listener);
    }

    onDisconnected(listener) {
        this.emitter.on('disconnected', listener);
    }

    onEvent(listener) {
        this.emitter.on('event', listener);
    }

    onError(listener) {
        this.emitter.on('error', listener);
    }
}

module.exports.Janus = Janus;
module.exports.ConnectionState = ConnectionState;
