'use strict';

var _ = require('lodash');

/**
 * @class
 */
class ResponseError extends Error {

    constructor(req, res) {
        super();
        this.name = this.constructor.name;
        this.message = _.get(res, 'error.reason', null);
        this.code = _.get(res, 'error.code', null);
        this.request = req;
        this.response = res;
    }

    getCode() {
        return this.code;
    }

    getMessage() {
        return this.message;
    }

    getRequest() {
        return this.request;
    }

    getResponse() {
        return this.response;
    }
}

/**
 * @class
 */
class PluginError extends ResponseError {

    constructor(req, res, plugin) {
        super(req, res);
        this.message = _.get(res, 'plugindata.data.error', null);
        this.code = _.get(res, 'plugindata.data.error_code', null);
        this.plugin = plugin;
    }

    getPlugin() {
        return this.plugin;
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

