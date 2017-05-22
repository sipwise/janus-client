'use strict';

var assert = require('chai').assert;
var Janus = require('../src/janus').Janus;
var WebSocketMock = require('../src/mock/websocket').WebSocketMock;

describe('VideoRoomPlugin', function(){

    var janus;
    var session;
    beforeEach(function(done){
        janus = new Janus({
            url: 'wss://localhost',
            WebSocket: WebSocketMock
        });
        janus.onConnected(()=>{
            janus.createSession().then(($session)=>{
                session = $session;
                done();
            }).catch((err)=>{
                done(err);
            });
        });
        janus.connect();
    });

    it('should return feeds of a room', function(done) {
        session.videoRoom().getFeeds(1234).then((feeds)=>{
            assert.isArray(feeds);
            done();
        }).catch((err)=>{
            done(err);
        });
    });

    it('should return feeds of a room excluding a specific feed', function(done) {
        session.videoRoom().getFeedsExclude(1, 1).then((feeds)=>{
            console.log(feeds);
            assert.isArray(feeds);
            assert.equal(feeds.length, 1);
            assert.equal(feeds[0], 2);
            done();
        }).catch((err)=>{
            done(err);
        });
    });
});
