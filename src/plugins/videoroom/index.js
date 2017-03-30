'use strict';

var Plugin = require('../plugin').Plugin;
var VideoRoomHandle = require('./handle').VideoRoomHandle;
var VideoRoomPublisher = require('./publisher').VideoRoomPublisher;
var VideoRoomListener = require('./listener').VideoRoomListener;

var AudioCodec = {
    opus: 'opus',
    isac32: 'isac32',
    isac16: 'isac16',
    pcmu: 'pcmu',
    pcma: 'pcma',
    g722: 'g722'
};

var VideoCodec = {
    vp8: 'vp8',
    vp9: 'vp9',
    h264: 'h264'
};

class VideoRoomPlugin extends Plugin {

    constructor(options) {
        super();
        this.name = 'videoroom';
        this.fullName = 'janus.plugin.' + this.name;
        this.session = options.session;
        this.$defaultHandle = null;
    }

    defaultHandle() {
        return new Promise((resolve, reject)=>{
            if(this.$defaultHandle === null) {
                this.createVideoRoomHandle().then((handle)=>{
                    this.$defaultHandle = handle;
                    resolve(this.$defaultHandle);
                }).catch((err)=>{
                    reject(err);
                });
            } else {
                resolve(this.$defaultHandle);
            }
        });
    }

    createVideoRoomHandle() {
        return new Promise((resolve, reject)=>{
            this.createHandle().then((id)=>{
                this.addHandle(new VideoRoomHandle({
                    id: id,
                    session: this.getSession()
                }));
                resolve(this.getHandle(id));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    createPublisherHandle(room) {
        return new Promise((resolve, reject)=>{
            this.createHandle().then((id)=>{
                this.addHandle(new VideoRoomPublisher({
                    id: id,
                    session: this.getSession(),
                    room: room
                }));
                resolve(this.getHandle(id));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    createListenerHandle(room, feed) {
        return new Promise((resolve, reject)=>{
            this.createHandle().then((id)=>{
                this.addHandle(new VideoRoomListener({
                    id: id,
                    session: this.getSession(),
                    room: room,
                    feed: feed
                }));
                resolve(this.getHandle(id));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    publishFeed(room, offer) {
        return new Promise((resolve, reject)=>{
            var handle = null;
            Promise.resolve().then(()=>{
                return this.createPublisherHandle(room);
            }).then((createdHandle)=>{
                handle = createdHandle;
                return handle.createAnswer(offer);
            }).then(()=>{
                resolve(handle);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    listenFeed(room, feed) {
        return new Promise((resolve, reject)=>{
            var handle = null;
            Promise.resolve().then(()=>{
                return this.createListenerHandle(room);
            }).then((createdHandle)=>{
                handle = createdHandle;
                return handle.createOffer();
            }).then(()=>{
                resolve(handle);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    getFeeds(room) {
        return new Promise((resolve, reject)=>{
            var feeds = [];
            Promise.resolve().then(()=>{
                return this.defaultHandle();
            }).then((handle)=>{
                return handle.listParticipants({ room: room });
            }).then((result)=>{
                if(result.participants.length > 0) {
                    for(let participant of result.participants) {
                        if(validator.toBoolean(participant.publisher)) {
                            feeds.push(participant.id);
                        }
                    }
                }
                resolve(feeds);
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

module.exports.VideoRoomPlugin = VideoRoomPlugin;
module.exports.AudioCodec = AudioCodec;
module.exports.VideoCodec = VideoCodec;
