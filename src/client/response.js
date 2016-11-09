'use strict';

var assert = require('chai').assert;
var _ = require('lodash');

/**
 * @class
 */
class ClientResponse {

    constructor(req, res) {
        assert.property(req, 'janus', 'Missing property janus in request');
        assert.property(res, 'janus', 'Missing property janus in response');
        this.request = req;
        this.response = res;
    }

    getRequest() {
        return this.request;
    }

    getResponse() {
        return this.response;
    }

    getType() {
        return _.get(this.response, 'janus', null);
    }

    getJsep() {
        return _.get(this.response, 'jsep', null);
    }

    isError() {
        return this.getType() === 'error';
    }

    isAck() {
        return this.getType() === 'ack';
    }

    isSuccess() {
        return this.getType() === 'success';
    }
}

class PluginResponse extends ClientResponse {

    constructor(req, res) {
        super(req, res);
        assert(_.has(res, 'plugindata.plugin'), 'Missing property plugindata.plugin');
        assert(_.has(res, 'plugindata.data'), 'Missing property plugindata.data');
    }

    isError() {
        return _.get(this.response, 'plugindata.data.error_code', null) !== null;
    }

    getName() {
        return _.get(this.response, 'plugindata.plugin', null);
    }

    getData() {
        return _.get(this.response, 'plugindata.data', null);
    }
}

module.exports.ClientResponse = ClientResponse;
module.exports.PluginResponse = PluginResponse;
