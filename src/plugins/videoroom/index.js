'use strict';

var assert = require('chai').assert;
var _ = require('lodash');
var Promise = require('bluebird');
var PluginHandle = require('../plugin-handle').PluginHandle;
var VideoRoom = require('./room').VideoRoom;
var PluginError = require('../../errors').PluginError;
var logger = require('debug-logger')('janus:videoroom:handle');
var Publisher = require('./publisher').Publisher;
var Listener = require('./listener').Listener;

var ParticipantType = {
    publisher: 'publisher',
    listener: 'listener'
};

var AudioCodec = {
    opus: 'opus',
    isac32: 'isac32',
    isac16: 'isac16',
    pcmu: 'pcmu',
    pcma: 'pcma'
};

var VideoCodec = {
    vp8: 'vp8',
    vp9: 'vp9',
    h264: 'h264'
};

/**
 * @class
 */
class VideoRoomHandle extends PluginHandle {

    static getName() {
        return 'janus.plugin.videoroom';
    }

    constructor(options) {
        super(options.id, options.session);
    }

    create(options) {
        return new Promise((resolve, reject)=>{
            options = options || {};
            var message = _.merge({
                request: 'create'
            }, options);
            this.requestMessage(message).then((res)=>{
                resolve({
                    room: res.getData().room,
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    destroy(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            var message = _.merge({
                request: 'destroy'
            }, options);
            this.requestMessage(message).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    exists(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            var message = _.merge({
                request: 'exists'
            }, options);
            this.requestMessage(message).then((res)=>{
                resolve({
                    exists: res.getData().exists,
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    list() {
        return new Promise((resolve, reject)=>{
            this.requestMessage({
                request: 'list'
            }).then((res)=>{
                resolve({
                    list: res.getData().list || [],
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    listParticipants(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            var message = _.merge({
                request: 'listparticipants'
            }, options);
            this.requestMessage(message).then((res)=>{
                resolve({
                    participants: res.getData().participants || [],
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    join(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            assert.property(options, 'ptype');
            var message = _.merge({
                request: 'join'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    id: res.getData().id,
                    jsep: res.getJsep(),
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    joinPublisher(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            var joinOptions = _.merge({
                ptype: ParticipantType.publisher
            }, options);
            this.join(joinOptions, {
                ack: true
            }).then((res)=>{
                resolve(res);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    joinListener(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            assert.property(options, 'feed');
            var joinOptions = _.merge({
                ptype: ParticipantType.listener
            }, options);
            this.join(joinOptions, {
                ack: true
            }).then((res)=>{
                resolve(res);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    configure(options) {
        return new Promise((resolve, reject)=>{
            options.audio = _.get(options, 'audio', true);
            options.video = _.get(options, 'video', true);
            var message = _.merge({
                request: 'configure'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    joinAndConfigure(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            assert.property(options, 'jsep');
            options.audio = _.get(options, 'audio', true);
            options.video = _.get(options, 'video', true);
            var message = _.merge({
                request: 'joinandconfigure',
                ptype: 'publisher'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    id: res.getData().id,
                    jsep: res.getJsep(),
                    publishers: res.getData().publishers,
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    publish(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'jsep');
            var message = _.merge({
                request: 'publish'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    unpublish(options) {
        return new Promise((resolve, reject)=>{
            var message = _.merge({
                request: 'unpublish'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    start(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            assert.property(options, 'jsep');
            var message = _.merge({
                request: 'start'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    /**
     * Note: Documented at https://janus.conf.meetecho.com/docs/janus__videoroom_8c.html,
     * but get error "423 Unknown request".
     * @deprecated
     */
    pause(options) {
        return new Promise((resolve, reject)=>{
            var message = _.merge({
                request: 'pause'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    switch(options) {
        return new Promise((resolve, reject)=>{
            var message = _.merge({
                request: 'switch'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    /**
     * Note: Documented at https://janus.conf.meetecho.com/docs/janus__videoroom_8c.html,
     * but get error "423 Unknown request".
     * @deprecated
     */
    stop(options) {
        return new Promise((resolve, reject)=>{
            var message = _.merge({
                request: 'stop'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    add(options) {
        return new Promise((resolve, reject)=>{
            var message = _.merge({
                request: 'add'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    remove(options) {
        return new Promise((resolve, reject)=>{
            var message = _.merge({
                request: 'remove'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    leave(options) {
        return new Promise((resolve, reject)=>{
            var message = _.merge({
                request: 'leave'
            }, options);
            this.requestMessage(message, {
                ack: true
            }).then((res)=>{
                resolve({
                    response: res
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    publishFeed(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'room');
            assert.property(options, 'jsep');
            this.joinAndConfigure(options).then((res)=>{
                resolve(res);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    listenFeed(options) {
        return this.joinListener(options);
    }

    createPublisher(room) {
        return new Promise((resolve, reject)=>{
            assert.isNotNaN(parseInt(room));
            var publisher = new Publisher({
                session: this.session,
                room: parseInt(room)
            });
            publisher.init().then(()=>{
                resolve(publisher);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    createListener(room, feed) {
        return new Promise((resolve, reject)=>{
            assert.isNotNaN(parseInt(room));
            assert.isNotNaN(parseInt(feed));
            var listener = new Listener({
                session: this.session,
                room: parseInt(room),
                feed: parseInt(feed)
            });
            listener.init().then(()=>{
                resolve(listener);
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

module.exports.VideoRoomHandle = VideoRoomHandle;
