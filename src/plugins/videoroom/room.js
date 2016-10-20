'use strict';

var logger = require('debug-logger')('janus:videoroom:room');

/**
 * @class
 */
class VideoRoom {

    constructor(options, handle) {
        this.room = options.room;
        this.handle = handle;
    }
}

module.exports.VideoRoom = VideoRoom;
