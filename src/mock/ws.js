'use strict';

var EventEmitter = require('events').EventEmitter;
var logger = require('debug-logger')('wsMock');

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
        }, 500);
    }

    on(event, listener) {
        this.emitter.on(event, listener);
    }

    send(message, cb) {
        setTimeout(()=>{
            cb();
            this.triggerMessage(message);
        }, 500);
    }

    triggerOpen() {
        setTimeout(()=>{
            this.emitter.emit('open');
        }, 500);
    }

    triggerMessage(message) {
        this.emitter.emit('message', message);
    }
}

module.exports.WebSocketMock = WebSocketMock;
