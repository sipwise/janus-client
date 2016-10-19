'use strict';

var _ = require('lodash');

/**
 * @class
 */
class ClientResponse {

    constructor(req, res) {
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

module.exports.ClientResponse = ClientResponse;
