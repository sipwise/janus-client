'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const JanusEvents = require('../constants').JanusEvents;
const logger = require('debug-logger')('janus:handle');
const PluginError = require('../errors').PluginError;
const PluginResponse = require('../client/response').PluginResponse;

const ConnectionState = {
    connected: 'connected',
    disconnected: 'disconnected'
};

/**
 * @class
 */
class PluginHandle {

    constructor(options) {
        this.id = options.id;
        this.opaqueId = options.opaqueId;
        this.plugin = options.plugin;
        this.emitter = new EventEmitter();
        this.connectionState = ConnectionState.disconnected;
        this.disposed = false;
    }

    getId() {
        return this.id;
    }

    getSession() {
        return this.getPlugin().getSession();
    }

    getPlugin() {
        return this.plugin;
    }

    isConnected() {
        return this.connectionState;
    }

    isDisposed() {
        return this.disposed;
    }

    detach() {
        return this.request({
            janus: 'detach'
        });
    }

    hangup() {
        return new Promise((resolve, reject)=>{
           if(this.isConnected()) {
               this.request({
                   janus: 'hangup'
               }).then((result)=>{
                   resolve(result);
               }).catch((err)=>{
                   reject(err);
               });
           } else {
               reject(new Error('Handle not connected'));
           }
        });
    }

    trickle(candidate) {
        return this.request({
            janus: 'trickle',
            candidate: candidate
        });
    }

    trickles(candidates) {
        return this.request({
            janus: 'trickle',
            candidates: candidates
        });
    }

    trickleCompleted() {
        return this.request({
            janus: 'trickle',
            candidate: {
                completed: true
            }
        });
    }

    event(event) {
        if(event.janus === JanusEvents.webrtcup) {
            this.connectionState = ConnectionState.connected;
        } else if (event.janus === JanusEvents.hangup) {
            this.connectionState = ConnectionState.disconnected;
        }
        if(_.has(JanusEvents, event.janus)) {
            this.emitter.emit(event.janus, event);
        } else {
            this.emitter.emit(JanusEvents.event, event);
        }
    }

    onWebrtcUp(listener) {
        this.emitter.addListener(JanusEvents.webrtcup, listener);
    }

    onMedia(listener) {
        this.emitter.addListener(JanusEvents.media, listener);
    }

    onHangup(listener) {
        this.emitter.addListener(JanusEvents.hangup, listener);
    }

    onSlowlink(listener) {
        this.emitter.addListener(JanusEvents.slowlink, listener);
    }

    onDetached(listener) {
        this.emitter.addListener(JanusEvents.detached, listener);
    }

    onEvent(listener) {
        this.emitter.addListener(JanusEvents.event, listener);
    }

    onTrickle(listener) {
        this.emitter.addListener(JanusEvents.trickle, listener);
    }

    request(obj, options) {
        obj.handle_id = this.getId();
        return this.getPlugin().getSession().request(obj, options);
    }

    requestMessage(body, options) {
        return new Promise((resolve, reject)=>{
            options = options || {};
            let jsep = _.get(body, 'jsep', null);
            let req = {
                janus: 'message',
                body: body
            };
            if(jsep !== null) {
                req.jsep = body.jsep;
                delete body.jsep;
            }
            this.request(req, options).then((res)=>{
                let pluginResponse = new PluginResponse(res.getRequest(), res.getResponse());
                if(pluginResponse.isError()) {
                    reject(new PluginError(res, this));
                } else {
                    resolve(pluginResponse);
                }
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    dispose() {
        return new Promise((resolve, reject)=>{
            if(!this.isDisposed()) {
                this.disposed = true;
                this.getPlugin().destroyHandle(this).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            } else {
                reject(new Error('Already disposed'));
            }
        });
    }
}

module.exports.PluginHandle = PluginHandle;
