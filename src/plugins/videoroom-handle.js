'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var PluginHandle = require('./plugin-handle').PluginHandle;
var PluginNames = require('../constants').PluginNames;
var PluginError = require('../errors').PluginError;


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
            var transaction = this.transactJsepMessage({
                request: 'configure',
                audio: true,
                video: true
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

    publish(options) {
        return new Promise((resolve, reject)=>{
            var joinResult = null;
            this.joinPublisher(options.room).then((res)=>{
                joinResult = res;
                return this.configure({ jsep: options.jsep });
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
            this.joinListener(options.room, options.feed).then((res)=>{
                resolve({
                    offer: _.get(res, 'jsep.sdp', null)
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

exports.VideoRoomHandle = VideoRoomHandle;
