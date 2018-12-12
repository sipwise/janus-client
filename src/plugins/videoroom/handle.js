'use strict';

var _ = require('lodash');
var assert = require('chai').assert;
var Promise = require('bluebird');
var PluginHandle = require('../handle').PluginHandle;
var logger = require('debug-logger')('janus:videoroom:handle');

var ParticipantType = {
    publisher: 'publisher',
    listener: 'listener'
};

/**
 * @class
 */
class VideoRoomHandle extends PluginHandle {

    constructor(options) {
        super(options);
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
                    exists: (res.getData().exists === 'true' || res.getData().exists === true),
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

    /**
     * This method should be called to publish a media stream to a specific room.
     * @public
     * @param options
     * @param options.room
     * @param options.jsep
     * @returns {Promise}
     */
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

    /**
     * This method should be called to receive media from a given feed.
     * @public
     * @param options
     * @param options.room Contains the room id.
     * @param options.feed Contains the id of the related publisher.
     * @returns {Promise}
     */
    listenFeed(options) {
        return this.joinListener(options);
    }
}

module.exports.VideoRoomHandle = VideoRoomHandle;
