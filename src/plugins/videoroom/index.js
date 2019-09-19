'use strict';

const _ = require('lodash');
const Plugin = require('../plugin').Plugin;
const VideoRoomHandle = require('./handle').VideoRoomHandle;
const VideoRoomPublisher = require('./publisher').VideoRoomPublisher;
const VideoRoomListener = require('./listener').VideoRoomListener;

const AudioCodec = {
    opus: 'opus',
    isac32: 'isac32',
    isac16: 'isac16',
    pcmu: 'pcmu',
    pcma: 'pcma',
    g722: 'g722'
};

const VideoCodec = {
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

    defaultHandle(options) {
        return new Promise((resolve, reject)=>{
            if(this.$defaultHandle === null) {
                this.createVideoRoomHandle(options)
                .then((handle)=>{
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

    createVideoRoomHandle(options) {
        return new Promise((resolve, reject)=>{
            this.createHandle(options)
            .then((id)=>{
                this.addHandle(new VideoRoomHandle({
                    id: id,
                    plugin: this
                }));
                resolve(this.getHandle(id));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    attachVideoRoomHandle(handleId, opaqueId) {
        return new Promise((resolve)=>{
            this.addHandle(new VideoRoomHandle({
                id: handleId,
                plugin: this,
                opaqueId: opaqueId
            }));
            let defaultHandle = this.getHandle(handleId);
            this.$defaultHandle = defaultHandle;
            resolve(defaultHandle);
        });
    }

    createPublisherHandle(room, opaqueId) {
        let options = { opaqueId: opaqueId };
        return new Promise((resolve, reject)=>{
            this.createHandle(options).then((id)=>{
                this.addHandle(new VideoRoomPublisher({
                    id: id,
                    plugin: this,
                    room: room,
                    opaqueId: opaqueId
                }));
                resolve(this.getHandle(id));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    attachPublisherHandle(handleId, room, opaqueId) {
        return new Promise((resolve)=>{
            this.addHandle(new VideoRoomPublisher({
                id: handleId,
                plugin: this,
                room: room,
                opaqueId: opaqueId
            }));
            resolve(this.getHandle(handleId));
        });
    }

    createListenerHandle(room, feed, opaqueId) {
        let options = { opaqueId: opaqueId };
        return new Promise((resolve, reject)=>{
            this.createHandle(options)
            .then((id)=>{
                this.addHandle(new VideoRoomListener({
                    id: id,
                    plugin: this,
                    room: room,
                    feed: feed,
                    opaqueId: opaqueId
                }));
                resolve(this.getHandle(id));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    attachListenerHandle(handleId, room, feed, opaqueId) {
        return new Promise((resolve)=>{
            this.addHandle(new VideoRoomListener({
                id: handleId,
                plugin: this,
                room: room,
                feed: feed,
                opaqueId: opaqueId
            }));
            resolve(this.getHandle(handleId));
        });
    }

    publishFeed(room, offer, opaqueId) {
        return new Promise((resolve, reject)=>{
            let handle = null;
            Promise.resolve().then(()=>{
                return this.createPublisherHandle(room, opaqueId);
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

    listenFeed(room, feed, opaqueId) {
        return new Promise((resolve, reject)=>{
            let handle = null;
            Promise.resolve().then(()=>{
                return this.createListenerHandle(room, feed, opaqueId);
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

    /**
     * Returns an array of publisher ids of a given room.
     * @param room Room number
     * @returns {Promise}
     */
    getFeeds(room) {
        return new Promise((resolve, reject)=>{
            let feeds = [];
            Promise.resolve().then(()=>{
                return this.defaultHandle();
            }).then((handle)=>{
                return handle.listParticipants({ room: room });
            }).then((result)=>{
                if(result.participants.length > 0) {
                    for(let participant of result.participants) {
                        if(participant.publisher === 'true' || participant.publisher === true) {
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

    /**
     * Returns a list of publisher ids excluding the given feed.
     * @param room
     * @param feed
     * @returns {Promise}
     */
    getFeedsExclude(room, feed) {
        return new Promise((resolve, reject)=>{
            this.getFeeds(room).then((feeds)=>{
                resolve(_.remove(feeds, ($feed)=>{
                    return $feed !== feed;
                }));
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

module.exports.VideoRoomPlugin = VideoRoomPlugin;
module.exports.AudioCodec = AudioCodec;
module.exports.VideoCodec = VideoCodec;
