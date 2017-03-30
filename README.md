
# Conferencing with Janus WebRTC Gateway

Node.js client that implements a subset of the WebSocket interface of the Janus WebRTC Gateway.

Note: For now it supports the videoroom plugin only.

## Setup janus client

```javascript
var JanusClient = require('janus-videoroom-client').Janus;
```

## Establish connection to the Janus WebSocket API

### 1. Create client

Without authentication

```javascript
var client = new JanusClient({
    url: 'ws://localhost:8188'
});
```

Token based authentication

```javascript
var client = new JanusClient({
    url: 'ws://localhost:8188',
    token: 'yourToken'
});
```

Static secret authentication

```javascript
var client = new JanusClient({
    url: 'ws://localhost:8188',
    apiSecret: 'yourStaticSecret'
});
```

### 2. Register events connected, disconnected, error

```javascript
client.onConnected(()=>{
    client.createSession().then((session)=>{
        ...
    }).catch((err)=>{
        ...
    })
});
```

```javascript
client.onDisconnected(()=>{
    
});
```

```javascript
client.onError((err)=>{
    
});
```

### 3. Call connect method

```javascript
client.connect();
```

## Create a new janus session

```javascript
client.createSession().then((session)=>{
    ...
});
```

## Create a new videoroom handle

```javascript
client.createSession().then((session)=>{
    return session.videoRoom().createVideoRoomHandle();
}).then((videoRoomHandle)=>{
    ...
});
```

## Get default videoroom handle

```javascript
client.createSession().then((session)=>{
    return session.videoRoom().defaultHandle();
}).then((videoRoomHandle)=>{
    ...
});
```

## Create a new videoroom

```javascript
videoRoomHandle.create({
   publishers: 3,
   is_private: 'no',
   secret: '****',
   pin: '****',
   audiocodec: 'opus',
   videocodec: 'vp8',
   record: false
}).then((result)=>{
    var roomId = result.room;
    ...
});
```

## Publish media stream

```javascript
session.videoRoom().publishFeed(room, offerSdp).then((publisherHandle)=>{
    var answerSdp = publisherHandle.getAnswer();
    ...
});
```

```javascript
publisherHandle.trickle(candidate).then(()=>{
    ...
});
```

## Subscribe to a media stream

```javascript
session.videoRoom().listenFeed(room, feed).then((listenerHandle)=>{
    var offerSdp = listenerHandle.getOffer();
    ...
});
```

```javascript
listenerHandle.trickle(candidate).then(()=>{
    ...
});
```

```javascript
listenerHandle.setRemoteAnswer(answerSdp).then(()=>{
    ...
});
```


## Get current published media streams

```javascript
session.videoRoom().getFeeds(room).then((feeds)=>{
    for(let feed of feeds) {
        ...
    }
});
```

## Run tests

    npm test








