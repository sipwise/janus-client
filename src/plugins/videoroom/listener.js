'use strict';

var Promise = require('bluebird');
var logger = require('debug-logger')('janus:videoroom:listener');
var VideoRoomHandle = require('./handle').VideoRoomHandle;

/**
 * @class
 */
class VideoRoomListener extends VideoRoomHandle {

    constructor(options) {
        super(options);
        this.room = options.room;
        this.feed = options.feed;
        this.offer = null;
    }

    getRoom() {
        return this.room;
    }

    getFeed() {
        return this.feed;
    }

    getOffer() {
        return this.offer;
    }

    createOffer() {
        return new Promise((resolve, reject)=>{
            this.listenFeed({
                room: this.getRoom(),
                feed: this.getFeed()
            }).then((result)=>{
                this.offer = result.jsep.sdp;
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    setRemoteAnswer(answer) {
        return new Promise((resolve, reject)=>{
            answer = answer.replace(/a=(sendrecv|sendonly)/, 'a=recvonly');
            this.start({
                room: this.getRoom(),
                feed: this.getFeed(),
                jsep: {
                    type: 'answer',
                    sdp: answer
                }
            }).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

module.exports.VideoRoomListener = VideoRoomListener;
