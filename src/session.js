'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var Plugins = require('./plugins');
var PluginNames = require('./constants').PluginNames;
var EventEmitter = require('events').EventEmitter;
var logger = require('debug-logger')('janus:session');

var State = {
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
        this.pluginHandles = {};
        this.keepAliveTimer = null;
        this.keepAliveInterval = 30000;
        this.keepAliveFails = 2;
        this.keepAliveFailCount = 0;
        this.emitter = new EventEmitter();
        this.state = (this.janus.isConnected()) ? State.alive : State.dead;
        this.startKeepAlive();
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
                this.keepAliveFailCount++;
                this.state = State.dying;
                this.emitter.emit('keepalive', false);
                if(this.keepAliveFailCount === this.keepAliveFails) {
                    this.state = State.dead;
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

    transact(obj) {
        this.startKeepAlive();
        obj.session_id = this.id;
        return this.janus.transact(obj);
    }

    request(obj, options) {
        this.startKeepAlive();
        obj.session_id = this.id;
        return this.janus.request(obj, options);
    }

    createPluginHandle(pluginName) {
        return new Promise((resolve, reject)=>{
            this.request({
                janus: 'attach',
                plugin: pluginName
            }).then((res)=>{
                logger.info('Created handle plugin=%s handle=%s', pluginName, res.getResponse().data.id);
                resolve(res.getResponse().data.id);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    addPluginHandle(pluginHandle) {
        this.pluginHandles[pluginHandle.getId()] = pluginHandle;
    }

    createVideoRoomHandle() {
        return new Promise((resolve, reject)=>{
            this.createPluginHandle(PluginNames.VideoRoom).then((id)=>{
                var pluginHandle = new Plugins.VideoRoom({
                    session: this,
                    id: id
                });
                this.addPluginHandle(pluginHandle);
                resolve(pluginHandle);
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
        this.destroy();
        this.emitter.emit('timeout');
    }

    onTimeout(listener) {
        this.emitter.on('timeout', listener);
    }

    onKeepAlive(listener) {
        this.emitter.on('keepalive', listener);
    }

    /**
     * @param event
     * @param [event.sender]
     */
    emitEvent(event) {
        if(event.sender && _.isObject(this.pluginHandles[event.sender])) {
            this.pluginHandles[event.sender].emitEvent(event);
        } else {
            this.emitter.emit('event', event);
        }
    }

    destroy() {
        this.stopKeepAlive();
        this.pluginHandles = {};
        this.janus = null;
    }
}

exports.Session = Session;
exports.SessionState = State;
