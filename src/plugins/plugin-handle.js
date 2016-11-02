'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var JanusEvents = require('../constants').JanusEvents;
var PluginError = require('../errors').PluginError;
var PluginResponse = require('../client/response').PluginResponse;

/**
 * @class
 */
class PluginHandle {

    constructor(id, session) {
        this.id = id;
        this.session = session;
        this.emitter = new EventEmitter();
    }

    getId() {
        return this.id;
    }

    getSession() {
        return this.session;
    }

    detach() {
        return this.request({
            janus: 'detach'
        });
    }

    hangup() {
        return this.request({
            janus: 'hangup'
        });
    }

    trickle(candidate) {
        return this.request({
            janus: 'trickle',
            candidate: candidate
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

    emitEvent(event) {

        switch(event.janus) {
            case JanusEvents.webrtcup:
                this.emitter.emit(JanusEvents.webrtcup);
                break;
            case JanusEvents.media:
                this.emitter.emit(JanusEvents.media);
                break;
            case JanusEvents.hangup:
                this.emitter.emit(JanusEvents.hangup);
                break;
            default:
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

    transact(obj) {
        obj.handle_id = this.getId();
        return this.session.transact(obj);
    }

    request(obj, options) {
        obj.handle_id = this.getId();
        return this.session.request(obj, options);
    }

    transactJsepMessage(body, jsep) {
        return this.transact({
            janus: 'message',
            body: body,
            jsep: jsep
        });
    }

    transactMessage(body) {
        return this.transact({
            janus: 'message',
            body: body
        });
    }

    requestMessage(body, options) {
        return new Promise((resolve, reject)=>{
            var req = {
                janus: 'message',
                body: body
            };
            this.request(req, options).then((res)=>{
                var pluginResponse = new PluginResponse(res.getRequest(), res.getResponse());
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
}

module.exports.PluginHandle = PluginHandle;
