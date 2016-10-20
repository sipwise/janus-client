'use strict';

var Promise = require('bluebird');
var logger = require('debug-logger')('janus:videoroom:participant');

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

module.exports.VideoRoomParticipant = VideoRoomParticipant;
