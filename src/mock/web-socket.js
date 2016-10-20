'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var logger = require('debug-logger')('web-socket-mock');
var janusResponse = require('./janus-response');

class WebSocketMock {

    constructor() {
        this.emitter = new EventEmitter();
        process.nextTick(()=>{
            this.triggerOpen();
        });
    }

    close() {
        logger.info('Close');
        setTimeout(()=>{
            this.emitter.emit('close');
        }, 80);
    }

    on(event, listener) {
        this.emitter.on(event, listener);
    }

    send(message, cb) {
        setTimeout(()=>{
            cb();
            var obj = JSON.parse(message);
            switch(obj.janus) {
                case 'info':
                    this.triggerMessage(janusResponse.info(obj));
                    break;
                case 'create':
                    this.triggerMessage(janusResponse.createSession(obj));
                    break;
                case 'destroy':
                    this.triggerMessage(janusResponse.destroySession(obj));
                    break;
                case 'keepalive':
                    this.triggerMessage(janusResponse.keepAlive(obj));
                    break;
                case 'attach':
                    switch(obj.plugin) {
                        case 'janus.plugin.videoroom':
                            this.triggerMessage(janusResponse.createVideoRoomHandle(obj));
                            break;
                    }
                    break;
                case 'message':
                    switch(obj.body.request) {
                        case 'create':
                            this.triggerMessage(janusResponse.createVideoRoom(obj));
                            break;
                    }
                    break;
                default:
                    this.triggerMessage(message);
                    break;
            }
        }, 80);
    }

    triggerOpen() {
        setTimeout(()=>{
            this.emitter.emit('open');
        }, 80);
    }

    triggerMessage(message) {
        var rawMessage = message;
        if(_.isObject(message)) {
            rawMessage = JSON.stringify(message);
        }
        this.emitter.emit('message', rawMessage);
    }
}

module.exports.WebSocketMock = WebSocketMock;
