'use strict';

var assert = require('chai').assert;
var ClientResponse = require('../src/client/response').ClientResponse;
var PluginResponse = require('../src/client/response').PluginResponse;
var JanusResponse = require('../src/mock/janus-response');

describe('Response', function(){

    describe('ClientResponse', function(){

        it('should return request and response', function(done){
            var createSessionReq = {
                janus: 'create',
                transaction: '1234567890'
            };
            var createSessionRes = JanusResponse.session.create(createSessionReq);
            var clientResponse = new ClientResponse(createSessionReq, createSessionRes);
            assert.deepEqual(clientResponse.getRequest(), createSessionReq);
            assert.deepEqual(clientResponse.getResponse(), createSessionRes);
            done();
        });

        it('should check whether the response is a success response', function(done){
            var createSessionReq = {
                janus: 'create',
                transaction: '1234567890'
            };
            var createSessionRes = JanusResponse.session.create(createSessionReq);
            var clientResponse = new ClientResponse(createSessionReq, createSessionRes);
            assert.equal(clientResponse.getType(), 'success');
            assert.isTrue(clientResponse.isSuccess());
            assert.isFalse(clientResponse.isAck());
            assert.isFalse(clientResponse.isError());
            done();
        });

        it('should check whether the response is a ack response', function(done){
            var keepAliveReq = {
                janus: 'keepalive',
                transaction: '1234567890'
            };
            var keepAliveRes = JanusResponse.session.keepAlive(keepAliveReq);
            var clientResponse = new ClientResponse(keepAliveReq, keepAliveRes);
            assert.equal(clientResponse.getType(), 'ack');
            assert.isFalse(clientResponse.isSuccess());
            assert.isTrue(clientResponse.isAck());
            assert.isFalse(clientResponse.isError());
            done();
        });

        it('should check whether the response is a error response', function(done){
            var createSessionReq = {
                janus: 'create',
                transaction: '1234567890'
            };
            var errRes = JanusResponse.error.general.unauthorized(createSessionReq);
            var clientResponse = new ClientResponse(createSessionReq, errRes);
            assert.equal(clientResponse.getType(), 'error');
            assert.isFalse(clientResponse.isSuccess());
            assert.isFalse(clientResponse.isAck());
            assert.isTrue(clientResponse.isError());
            done();
        });
    });

    describe('PluginResponse', function(){

        it('should return plugin name and data', function(){
            var createRoomReq = {
                janus: 'message',
                body: {
                    request: 'create'
                },
                handle_id: 123,
                session_id: 456,
                transaction: 'abc'
            };
            var createRoomRes = JanusResponse.videoRoomHandle.create(createRoomReq);
            var pluginResponse = new PluginResponse(createRoomReq, createRoomRes);
            assert.equal(pluginResponse.getName(), createRoomRes.plugindata.plugin);
            assert.deepEqual(pluginResponse.getData(), createRoomRes.plugindata.data);
        });

        it('should return error code and message', function(){
            var destroyRoomReq = {
                janus: 'message',
                body: {
                    request: 'destroy',
                    room: 123
                },
                handle_id: 456,
                session_id: 789,
                transaction: 'abc'
            };
            var destroyRoomRes = JanusResponse.videoRoomHandle.error.destroy(destroyRoomReq);
            var pluginResponse = new PluginResponse(destroyRoomReq, destroyRoomRes);
            assert.isTrue(pluginResponse.isError());
        });
    });
});
