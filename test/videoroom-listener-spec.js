'use strict';

var VideoRoomListener = require('../src/plugins/videoroom/listener').VideoRoomListener;

describe('VideoRoomListener', function(){

    it('should create a new VideoRoomListener', function(){
        var publisher = new VideoRoomListener({
            room: 123,
            feed: 456,
            plugin: {
                getSession() {}
            }
        });
    });
});

