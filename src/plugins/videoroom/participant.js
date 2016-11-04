'use strict';

var Promise = require('bluebird');
var logger = require('debug-logger')('janus:videoroom:participant');
var JanusEvents = require('../../constants').JanusEvents;
var EventEmitter = require('events');

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
        this.emitter = new EventEmitter();
    }

    init() {
        return new Promise((resolve, reject)=>{
            this.session.createVideoRoomHandle().then((handle)=>{
                this.handle = handle;
                this.handle.onWebrtcUp((event)=>{ this.emitter.emit(JanusEvents.webrtcup, event); });
                this.handle.onMedia((event)=>{ this.emitter.emit(JanusEvents.media, event); });
                this.handle.onHangup((event)=>{ this.emitter.emit(JanusEvents.hangup, event); });
                this.handle.onEvent((event)=>{ this.emitter.emit(JanusEvents.event, event); });
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

    trickleCompleted() {
        return this.handle.trickleCompleted();
    }

    onWebrtcUp(listener) {
        this.emitter.addListener(JanusEvents.webrtcup, listener);
    }

    onMedia(listener) {
        this.emitter.addListener(JanusEvents.media, listener);
    }

    onHangup(listener) {
        this.emitter.addListener(JanusEvents.hangup, listener);
    }

    onEvent(listener) {
        this.emitter.addListener(JanusEvents.event, listener);
    }

    close() {
        this.handle.detach();
    }
}

module.exports.VideoRoomParticipant = VideoRoomParticipant;
