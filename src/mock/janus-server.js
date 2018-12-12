'use strict';

var _ = require('lodash');
var http = require('http');
var WebSocketServer = require('ws').Server;
var JanusResponse = require('../mock/janus-response');
var logger = require('debug-logger')('mock:janus-server');

/**
 * @class
 */
class JanusServer {

    constructor(options) {
        this.port = options.port || 9002;
        this.http = http.createServer();
        this.ws = new WebSocketServer({
            server: this.http
        });
        this.ws.on('connection',(webSocket)=>{ this.triggerConnection(webSocket); });
        this.handlesByName = {
            'janus.plugin.videoroom': 773735142
        };
        this.handlesById = _.invert(this.handlesByName);
    }

    init() {
        return new Promise((resolve, reject)=>{
            this.http.listen(this.port, (err)=>{
                if(_.isObject(err)) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    triggerConnection(webSocket) {
        webSocket.on('message', (msg)=>{ this.triggerMessage(msg, webSocket); });
        webSocket.on('close', ()=>{ this.triggerClose(webSocket); });
    }

    triggerMessage(message, webSocket) {
        try {
            this.dispatchObject(JSON.parse(message), webSocket);
        } catch(err) {
            logger.warn('Dropped invalid message');
        }
    }

    triggerClose() {
        logger.info('Closed WebSocket');
    }

    dispatchObject(object, webSocket) {

        logger.info(object);

        switch(object.janus) {
            case 'info':
                this.send(webSocket, JanusResponse.general.info(object));
                break;
            case 'create':
                this.send(webSocket, JanusResponse.session.create(object));
                break;
            case 'destroy':
                this.send(webSocket, JanusResponse.session.destroy(object));
                break;
            case 'keepalive':
                this.send(webSocket, JanusResponse.session.keepAlive(object));
                break;
            case 'attach':
                switch(object.plugin) {
                    case 'janus.plugin.videoroom':
                        this.send(webSocket, JanusResponse.session.createVideoRoomHandle(
                            object, this.handlesByName[object.plugin]));
                        break;
                }
                break;
            case 'detach':
                this.send(webSocket, JanusResponse.handle.detach(object));
                break;
            case 'hangup':
                this.send(webSocket, JanusResponse.handle.hangup(object));
                break;
            case 'trickle':
                this.send(webSocket, JanusResponse.handle.trickle(object));
                break;
            case 'message':
                var plugin = this.handlesById[object.handle_id];
                switch(plugin) {
                    case 'janus.plugin.videoroom':
                        this.dispatchVideoRoom(webSocket, object);
                        break;
                }
                break;
            default:
                break;
        }
    }

    dispatchVideoRoom(webSocket, object) {
        switch(object.body.request) {
            case 'create':
                this.send(webSocket, JanusResponse.videoRoomHandle.create(object));
                break;
            case 'destroy':
                this.send(webSocket, JanusResponse.videoRoomHandle.destroy(object));
                break;
            case 'list':
                this.send(webSocket, JanusResponse.videoRoomHandle.list(object));
                break;
            case 'exists':
                this.send(webSocket, JanusResponse.videoRoomHandle.exists(object));
                break;
            case 'listparticipants':
                this.send(webSocket, JanusResponse.videoRoomHandle.listParticipants(object));
                break;
            case 'join':
                this.send(webSocket, JanusResponse.general.ack(object));
                this.send(webSocket, JanusResponse.videoRoomHandle.join(object));
                break;
        }
    }

    send(webSocket, response) {
        webSocket.send(JSON.stringify(response));
    }

    close() {
        this.http.close();
    }
}

module.exports.JanusServer = JanusServer;
