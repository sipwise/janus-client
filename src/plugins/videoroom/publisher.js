'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var logger = require('debug-logger')('janus:videoroom:publisher');
var VideoRoomParticipant = require('./participant').VideoRoomParticipant;

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

module.exports.Publisher = Publisher;
