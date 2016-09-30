'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var JanusEvents = require('../constants').JanusEvents;

/**
 * @class
 */
class PluginHandle {

    constructor(name, id, session) {
        this.name = name;
        this.id = id;
        this.session = session;
        this.emitter = new EventEmitter();
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }

    getSession() {
        return this.session;
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
            this.request({
                janus: 'message',
                body: body
            }, options).then((res)=>{
                resolve(res);
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

exports.PluginHandle = PluginHandle;
