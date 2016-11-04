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

    create() {
        return new Promise((resolve, reject)=>{
            this.requestMessage({
                request: 'create'
            }).then((res)=>{
                assert.isNumber(res.getData().room, 'Missing room id in response');
                resolve(new VideoRoom({
                    room: res.getData().room
                }, this));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    destroy(room) {
        return new Promise((resolve, reject)=>{
            assert.isNotNaN(parseInt(room));
            this.requestMessage({
                request: 'destroy',
                room: parseInt(room)
            }).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    exists(room) {
        return new Promise((resolve, reject)=>{
            assert.isNotNaN(parseInt(room));
            this.requestMessage({
                request: 'exists',
                room: parseInt(room)
            }).then((res)=>{
                resolve(res.getData().exists);
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
                resolve(res.getData().list || []);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    joinPublisher(room) {
        return new Promise((resolve, reject)=>{
            assert.isNotNaN(parseInt(room));
            this.requestMessage({
                request: 'join',
                ptype: 'publisher',
                room: room
            }, {
                ack: true
            }).then((res)=>{
                resolve(res.getResponse());
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    joinListener(room, feed) {
        return new Promise((resolve, reject)=>{
            assert.isNotNaN(parseInt(room));
            assert.isNotNaN(parseInt(feed));
            this.requestMessage({
                request: 'join',
                ptype: 'listener',
                room: room,
                feed: feed
            }, {
                ack: true
            }).then((res)=>{
                resolve(res.getResponse());
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    configure(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'jsep', 'Missing option jsep');
            var audio = _.get(options, 'audio', true);
            var video = _.get(options, 'video', true);
            this.requestMessage({
                request: 'configure',
                audio: audio,
                video: video
            }, {
                ack: true,
                jsep: options.jsep
            }).then((res)=>{
                resolve(res.getResponse());
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    start(options) {
        return new Promise((resolve, reject)=>{
            assert.property(options, 'jsep', 'Missing option jsep');
            this.requestMessage({
                request: 'start',
                room: options.room,
                feed: options.feed
            }, {
                ack: true,
                jsep: options.jsep
            }).then((res)=>{
                resolve(res.getResponse());
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    publish(options) {
        return new Promise((resolve, reject)=>{
            var joinResult = null;
            var room = _.get(options, 'room', null);
            if(room === null) {
                throw new Error('Missing argument room');
            }
            this.joinPublisher(options.room).then((res)=>{
                joinResult = res;
                return this.configure({
                    audio: options.audio,
                    video: options.video,
                    jsep: options.jsep
                });
            }).then((res)=>{
                resolve({
                    id: _.get(joinResult, 'plugindata.data.id', null),
                    publishers: _.get(joinResult, 'plugindata.data.publishers', []),
                    answer: _.get(res, 'jsep.sdp', null)
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    listen(options) {
        return new Promise((resolve, reject)=>{
            this.joinListener(options.room, options.feed).then((joinResult)=>{
                resolve({
                    id: _.get(joinResult, 'plugindata.data.id', null),
                    offer: _.get(joinResult, 'jsep.sdp', null)
                });
            }).catch((err)=>{
                reject(err);
            });
        });
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
