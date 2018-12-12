'use strict';

var assert = require('chai').assert;
var _ = require('lodash');

/**
 * @class
 */
class ResponseError extends Error {

    constructor(res) {
        super();
        this.name = this.constructor.name;
        this.message = _.get(res.getResponse(), 'error.reason', null);
        this.code = _.get(res.getResponse(), 'error.code', null);
        this.response = res;
    }

    getCode() {
        return this.code;
    }

    getMessage() {
        return this.message;
    }

    getResponse() {
        return this.response;
    }
}

/**
 * @class
 */
class PluginError extends ResponseError {

    constructor(res, handle) {
        super(res);
        assert(_.has(res.getResponse(), 'plugindata.data.error'));
        assert(_.has(res.getResponse(), 'plugindata.data.error_code'));
        this.message = _.get(res.getResponse(), 'plugindata.data.error', null);
        this.code = _.get(res.getResponse(), 'plugindata.data.error_code', null);
        this.handle = handle;
    }

    getHandle() {
        return this.handle;
    }
}

/**
 * @class
 */
class RequestTimeoutError extends Error {

    constructor(req) {
        super();
        this.name = this.constructor.name;
        this.message = 'Request timeout';
        this.request = req;
    }
}

module.exports.ResponseError = ResponseError;
module.exports.RequestTimeoutError = RequestTimeoutError;
module.exports.PluginError = PluginError;

