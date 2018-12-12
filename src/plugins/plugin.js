'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

class Plugin {

    constructor(options) {
        options = options || {};
        this.name = options.name;
        this.fullName = options.fullName;
        this.session = options.session;
        this.handles = new Map();
    }

    getName() {
        return this.name;
    }

    getFullName() {
        return this.fullName;
    }

    getSession() {
        return this.session;
    }

    setSession(session) {
        this.session = session;
    }

    addHandle(handle) {
        this.handles.set(handle.getId(), handle);
    }

    hasHandle(id) {
        return this.handles.has(id);
    }

    getHandle(id) {
        return this.handles.get(id);
    }

    removeHandle(id) {
        this.handles.delete(id);
    }

    createHandle() {
        return new Promise((resolve, reject)=>{
            this.getSession().createPluginHandle(this.getFullName()).then((handleId)=>{
                resolve(handleId);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    destroyHandle(handle) {
        return this.destroyHandleById(handle.getId());
    }

    destroyHandleById(id) {
        return new Promise((resolve, reject)=>{
            if(this.hasHandle(id)) {
                let handle = this.getHandle(id);
                handle.detach().then(()=>{
                    this.removeHandle(id);
                    resolve();
                }).catch((err)=>{
                    this.removeHandle(id);
                    reject(err);
                });
            } else {
                this.removeHandle(id);
                reject(new Error('Invalid handle id ' + id));
            }
        });
    }
}

module.exports.Plugin = Plugin;
