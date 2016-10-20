'use strict';

var Promise = require('bluebird');
var logger = require('debug-logger')('janus:videoroom:listener');
var VideoRoomParticipant = require('./participant').VideoRoomParticipant;

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

module.exports.Listener = Listener;
