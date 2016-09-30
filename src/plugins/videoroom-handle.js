'use strict';

var createId = require('uuid').v4;
var _ = require('lodash');
var Promise = require('bluebird');
var PluginHandle = require('./plugin-handle').PluginHandle;
var PluginNames = require('../constants').PluginNames;
var PluginError = require('../errors').PluginError;
var EventEmitter = require('events').EventEmitter;
var logger = require('debug-logger')('janus:videoroom');

/**
 * @class
 */
class VideoRoomHandle extends PluginHandle {

    constructor(options) {
        super(PluginNames.VideoRoom, options.id, options.session);
    }

    create() {
        return new Promise((resolve, reject)=>{
            this.requestMessage({
                request: 'create'
            }).then((res)=>{
                resolve(new VideoRoom({
                    room: _.get(res.getResponse(), 'plugindata.data.room', null)
                }, this));
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
                resolve(_.get(res.getResponse(), 'plugindata.data.list', []));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    joinPublisher(room) {
        return new Promise((resolve, reject)=>{
            var transaction = this.transactMessage({
                request: 'join',
                ptype: 'publisher',
                room: room
            }).onResponse((res)=>{
                var videoRoom = _.get(res.getResponse(), 'plugindata.data.videoroom', null);
                var errorCode = _.get(res.getResponse(), 'plugindata.data.error', null);
                if(errorCode !== null) {
                    reject(new PluginError(transaction.getRequest(), res.getResponse(), this));
                } else if(videoRoom === 'joined') {
                    resolve(res.getResponse());
                } else {
                    reject(new Error('Unknown response'));
                }
            }).start();
        });
    }

    joinListener(room, feed) {
        return new Promise((resolve, reject)=>{
            var transaction = this.transactMessage({
                request: 'join',
                ptype: 'listener',
                room: room,
                feed: feed
            }).onResponse((res)=>{
                var videoRoom = _.get(res.getResponse(), 'plugindata.data.videoroom', null);
                var errorCode = _.get(res.getResponse(), 'plugindata.data.error', null);
                if(errorCode !== null) {
                    reject(new PluginError(transaction.getRequest(), res.getResponse(), this));
                } else if(videoRoom === 'attached') {
                    resolve(res.getResponse());
                } else {
                    reject(new Error('Unknown response'));
                }
            }).start();
        });
    }

    configure(options) {
        return new Promise((resolve, reject)=>{

            var audio = _.get(options, 'audio', true);
            var video = _.get(options, 'video', true);

            var jsep = _.get(options, 'jsep', null);
            if(jsep === null) {
                throw new Error('Missing argument jsep');
            }

            var transaction = this.transactJsepMessage({
                request: 'configure',
                audio: audio,
                video: video
            }, options.jsep).onResponse((res)=>{
                var configured = _.get(res.getResponse(), 'plugindata.data.configured', null);
                var errorCode = _.get(res.getResponse(), 'plugindata.data.error', null);
                if(errorCode !== null) {
                    reject(new PluginError(transaction.getRequest(), res.getResponse(), this));
                } else if(configured === 'ok') {
                    resolve(res.getResponse());
                } else {
                    reject(new Error('Unknown response'));
                }
            }).start();
        });
    }

    start(options) {
        return new Promise((resolve, reject)=>{

            var jsep = _.get(options, 'jsep', null);
            if(jsep === null) {
                throw new Error('Missing argument jsep');
            }

            var transaction = this.transactJsepMessage({
                request: 'start',
                room: options.room,
                feed: options.feed
            }, options.jsep).onResponse((res)=>{
                var started = _.get(res.getResponse(), 'plugindata.data.started', null);
                var errorCode = _.get(res.getResponse(), 'plugindata.data.error', null);
                if(errorCode !== null) {
                    reject(new PluginError(transaction.getRequest(), res.getResponse(), this));
                } else if(started === 'ok') {
                    resolve(res.getResponse());
                } else {
                    reject(new Error('Unknown response'));
                }
            }).start();
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

    trickle(candidate) {
        return this.request({
            janus: 'trickle',
            candidate: candidate
        });
    }

    createPublisher(room) {
        return new Promise((resolve, reject)=>{
            var publisher = new Publisher({
                session: this.session,
                room: room
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
            var listener = new Listener({
                session: this.session,
                room: room,
                feed: feed
            });
            listener.init().then(()=>{
                resolve(listener);
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

/**
 * @class
 */
class VideoRoom {

    constructor(options, handle) {
        this.room = options.room;
        this.handle = handle;
    }
}

/**
 * @class
 */
class VideoRoomParticipant {

    constructor(options) {
        this.session = options.session;
        this.offer = options.offer;
        this.room = options.room;
        this.handle = null;
        this.answer = null;
    }

    init() {
        return new Promise((resolve, reject)=>{
            this.session.createVideoRoomHandle().then((handle)=>{
                this.handle = handle;
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    getRoom() {
        return this.room;
    }

    setOffer(offer) {
        this.offer = offer;
    }

    getOffer() {
        return this.offer;
    }

    setAnswer(answer) {
        this.answer = answer;
    }

    getAnswer() {
        return this.answer;
    }

    trickle(candidate) {
        return this.handle.trickle(candidate);
    }
}

/**
 * @class
 */
class Publisher extends VideoRoomParticipant {

    constructor(options) {
        super(options);
        this.id = options.id;
        this.emitter = new EventEmitter();
        this.listeners = {};
    }

    getId() {
        return this.id;
    }

    addListener(listener) {
        this.listeners[listener.getFeed()] = listener;
    }

    removeListener(id) {
        delete this.listeners[id];
    }

    join(offer) {
        return new Promise((resolve, reject)=>{
            this.setOffer(offer);
            this.handle.publish({
                room: this.room,
                jsep: {
                    type: 'offer',
                    sdp: this.getOffer()
                }
            }).then((result)=>{
                this.id = result.id;
                this.answer = result.answer;
                _.forEach(result.publishers, (publisher)=>{
                    this.handle.createListener(this.room, publisher.id).then((listener)=>{
                        this.addListener(listener);
                        return listener.createOffer();
                    }).then(()=>{
                        this.emitter.emit('joined', this.listeners[publisher.id]);
                    }).catch((err)=>{
                        logger.error(err);
                    });
                });
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    onJoined(listener) {
        this.emitter.on('joined', listener);
    }
}

/**
 * @class
 */
class Listener extends VideoRoomParticipant {

    constructor(options) {
        super(options);
        this.feed = options.feed;
    }

    getFeed() {
        return this.feed;
    }

    createOffer() {
        return new Promise((resolve, reject)=>{
            this.handle.listen({
                room: this.room,
                feed: this.feed
            }).then((result)=>{
                this.offer = result.offer;
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    setAnswer(sdp) {
        this.answer = sdp.replace(/a=(sendrecv|sendonly)/, 'a=recvonly');
    }

    setRemoteAnswer(answer) {
        return new Promise((resolve, reject)=>{
            this.setAnswer(answer);
            this.handle.start({
                room: this.room,
                feed: this.feed,
                jsep: {
                    type: 'answer',
                    sdp: this.getAnswer()
                }
            }).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

exports.VideoRoomHandle = VideoRoomHandle;
