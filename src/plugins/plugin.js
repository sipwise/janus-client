'use strict';

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
            this.session.createPluginHandle(this.getFullName()).then((handleId)=>{
                resolve(handleId);
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}

module.exports.Plugin = Plugin;
