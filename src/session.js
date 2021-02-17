'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const logger = require('debug-logger')('janus:session');
const VideoRoomPlugin = require('./plugins/videoroom').VideoRoomPlugin;

const State = {
    alive: 'alive',
    dying: 'dying',
    dead: 'dead'
};

/**
 * @class
 */
class Session {

    constructor(id, janus) {
        this.id = id;
        this.janus = janus;
        this.keepAliveTimer = null;
        this.keepAliveInterval = 30000;
        this.keepAliveFails = 2;
        this.keepAliveFailCount = 0;
        this.emitter = new EventEmitter();
        this.state = (this.janus.isConnected()) ? State.alive : State.dead;
        this.startKeepAlive();
        this.videoRoomPlugin = new VideoRoomPlugin({ 
            session: this,
            allowStringIds: janus.allowStringIds,
        });
    }

    keepAlive() {
        return this.janus.request({
            janus: 'keepalive',
            session_id: this.id
        });
    }

    startKeepAlive() {
        this.stopKeepAlive();
        this.keepAliveTimer = setInterval(()=> {
            this.keepAlive().then(()=>{
                this.keepAliveFailCount = 0;
                this.state = State.alive;
                this.emitter.emit('keepalive', true);
            }).catch(()=>{
                this.keepAliveFailCount = this.keepAliveFailCount + 1;
                this.state = State.dying;
                this.emitter.emit('keepalive', false);
                if(this.keepAliveFailCount >= this.keepAliveFails) {
                    this.state = State.dead;
                    this.stopKeepAlive();
                    this.timeout();
                }
            });
        }, this.keepAliveInterval);
    }

    stopKeepAlive() {
        if(this.keepAliveTimer !== null) {
            clearInterval(this.keepAliveTimer);
        }
    }

    request(obj, options) {
        this.startKeepAlive();
        obj.session_id = this.id;
        return this.janus.request(obj, options);
    }

    createPluginHandle(plugin, options) {
        let opaqueId = options ? options.opaqueId : undefined;
        return new Promise((resolve, reject)=>{
            this.request({
                janus: 'attach',
                plugin: plugin,
                opaque_id: opaqueId
            }).then((res)=>{
                let handleId = _.get(res.getResponse(), 'data.id', null);
                if(handleId !== null) {
                    logger.info('Created handle plugin=%s handle=%s', plugin, handleId);
                    resolve(handleId);
                } else {
                    reject(new Error('Handle not created properly'));
                }
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    getId() {
        return this.id;
    }

    getState() {
        return this.state;
    }

    isAlive() {
        return this.state === State.alive;
    }

    timeout() {
        this.destroy().then(()=>{
            logger.debug('Destroyed session=%s', this.id);
            this.emitter.emit('timeout');
        }).catch(()=>{
            logger.debug('Failed to destroy session=%s', this.id);
            this.emitter.emit('timeout');
        });
    }

    onTimeout(listener) {
        this.emitter.on('timeout', listener);
    }

    onKeepAlive(listener) {
        this.emitter.on('keepalive', listener);
    }

    onError(listener) {
        this.emitter.on('error', listener);
    }

    onEvent(listener) {
        this.emitter.on('event', listener);
    }

    event(event) {
        if(this.videoRoomPlugin.hasHandle(event.sender)) {
            this.videoRoomPlugin.getHandle(event.sender).event(event);
        } else {
            this.emitter.emit('event', event);
        }
    }

    async destroy() {
        this.stopKeepAlive();
        try {
            await this.janus.destroySession(this.getId());
        } catch(err) {
            logger.debug(err);
            logger.warn('Could not destroy remote session')
        }
    }

    videoRoom() {
        return this.videoRoomPlugin;
    }
}

module.exports = {
    Session,
    State
};
