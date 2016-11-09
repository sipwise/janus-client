'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var JanusEvents = require('../constants').JanusEvents;
var PluginError = require('../errors').PluginError;
var PluginResponse = require('../client/response').PluginResponse;
var logger = require('debug-logger')('janus:handle');

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

    event(event) {
        switch(event.janus) {
            case JanusEvents.webrtcup:
                this.emitter.emit(JanusEvents.webrtcup, event);
                break;
            case JanusEvents.media:
                this.emitter.emit(JanusEvents.media, event);
                break;
            case JanusEvents.hangup:
                this.emitter.emit(JanusEvents.hangup, event);
                break;
            case JanusEvents.event:
                this.emitter.emit(JanusEvents.event, event);
                break;
            default:
                logger.warn('Dropped unknown handle event', event);
                break;
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

    onEvent(listener) {
        this.emitter.addListener(JanusEvents.event, listener);
    }

    request(obj, options) {
        obj.handle_id = this.getId();
        return this.session.request(obj, options);
    }

    requestMessage(body, options) {
        return new Promise((resolve, reject)=>{
            options = options || {};
            var jsep = _.get(body, 'jsep', null);
            var req = {
                janus: 'message',
                body: body
            };
            if(jsep !== null) {
                req.jsep = body.jsep;
                delete body.jsep;
            }
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
