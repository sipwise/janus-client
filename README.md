
# Conferencing with Janus WebRTC Gateway

Node.js client that implements a subset of the WebSocket interface of the Janus WebRTC Gateway.

Note: For now it supports the videoroom plugin only.

## Initial setup

```javascript
var JanusVideoroomClient = require('janus-videoroom-client').Janus;
```

Without authentication

```javascript
var client = new JanusVideoroomClient({
    url: 'ws://localhost:8188'
});
```

Token based authentication

```javascript
var client = new JanusVideoroomClient({
    url: 'ws://localhost:8188',
    token: 'yourToken'
});
```

Static secret authentication

```javascript
var client = new JanusVideoroomClient({
    url: 'ws://localhost:8188',
    apiSecret: 'yourStaticSecret'
});
```

## Usage

Create a new janus session

```javascript
client.createSession().then((session)=>{
    ...
}).catch((err)=>{
    ...
});
```

Create a new videoroom handle

```javascript
client.createSession().then((session)=>{
    return session.createVideoRoomHandle();
}).then((handle)=>{
    ...
}).catch((err)=>{
    ...
});
```

## Run tests

    npm test








