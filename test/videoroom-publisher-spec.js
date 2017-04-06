'use strict';

var VideoRoomPublisher = require('../src/plugins/videoroom/publisher').VideoRoomPublisher;

describe('VideoRoomPublisher', function(){

    it('should create a new VideoRoomPublisher', function(){
        var publisher = new VideoRoomPublisher({
            room: 123,
            plugin: {
                getSession() {}
            }
        });
    });
});
