'use strict';

const _ = require('lodash');
const logger = require('debug-logger')('janus:videoroom:publisher');
const VideoRoomHandle = require('./handle').VideoRoomHandle;

/**
 * @class
 */
class VideoRoomPublisher extends VideoRoomHandle {

    constructor(options) {
        super(options);
        this.publisherId = null;
        this.room = options.room;
        this.answer = null;
    }

    getPublisherId() {
        return this.publisherId;
    }

    getRoom() {
        return this.room;
    }

    getAnswer() {
        return this.answer;
    }

    createAnswer(offer) {
        return new Promise((resolve, reject)=>{
            this.publishFeed({
                room: this.getRoom(),
                jsep: {
                    type: 'offer',
                    sdp: offer
                }
            }).then((result)=>{
                this.publisherId = result.id;
                this.answer = result.jsep.sdp;
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

module.exports.VideoRoomPublisher = VideoRoomPublisher;
