'use strict';

const _ = require('lodash');
const JanusResponse = require('../mock/janus-response');

const Plugins = {
    janus_plugin_videoroom: 'janus.plugin.videoroom'
};

class WebSocketMock {

    constructor(url, protocol) {
        this.url = url;
        this.protocol = protocol;
        this.readyState = 0;
        this.open();
        this.delay = 10;

        this.sessions = new Map();
        this.sessionCounter = 0;
        this.handles = new Map();
        this.handleCounter = 0;
    }

    open() {
        setTimeout(()=>{
            this.readyState = 1;
            this.emit('open');
        }, this.delay);
    }

    close() {
        this.readyState = 2;
        setTimeout(()=>{
            this.readyState = 3;
            this.emit('close');
        }, this.delay);
    }

    send(message, cb) {
        let parsedMessage = message;
        if(_.isString(message)) {
            parsedMessage = JSON.parse(message);
        }
        if(_.isFunction(cb)) {
            cb();
        }
        setTimeout(()=>{
            this.dispatchMessage(parsedMessage);
        }, this.delay);
    }

    dispatchMessage(parsedMessage) {
        switch(parsedMessage.janus) {
            case 'info':
                this.emitMessage(JanusResponse.general.info(parsedMessage));
                break;
            case 'create':
                this.emitMessage(JanusResponse.session.create(parsedMessage));
                break;
            case 'attach':
                this.attachHandle(parsedMessage);
                break;
            case 'message':
                this.dispatchPluginMessage(parsedMessage);
                break;
        }
    }

    attachHandle(parsedMessage) {
        switch(parsedMessage.plugin) {
            case Plugins.janus_plugin_videoroom:
                this.handleCounter++;
                this.handles.set(this.handleCounter, Plugins.janus_plugin_videoroom);
                this.emitMessage(JanusResponse.session.createVideoRoomHandle(parsedMessage, this.handleCounter));
                break;
        }
    }

    dispatchPluginMessage(parsedMessage) {
        let plugin = this.handles.get(parsedMessage.handle_id);
        switch(plugin) {
            case Plugins.janus_plugin_videoroom:
                switch(parsedMessage.body.request) {
                    case 'listparticipants':
                        this.emitMessage(JanusResponse.videoRoomHandle.listParticipants(
                          parsedMessage, this.handleCounter));
                        break;
                }
                break;
        }
    }

    emitMessage(message) {
        this.emit('message', {
            data: message
        });
    }

    emit() {
        let newArgs = _.drop(arguments, 1);
        const event = arguments[0] && `on${arguments[0]}`;

        if (this.hasOwnProperty(event) && _.isFunction(this[event])) {
            this[event].apply(this, newArgs);
        }
    }

    removeAllListeners(name) {
        if (this.hasOwnProperty(name)) {
            this.delete(name);
        }
    }
}

module.exports.WebSocketMock = WebSocketMock;
