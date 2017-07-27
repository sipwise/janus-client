
module.exports = {

    error: {
        general: {
            unauthorized: function unauthorized(req) {
                return {
                    janus: 'error',
                    transaction: req.transaction,
                    error: {
                        code: 403,
                        reason: 'Unauthorized request (wrong or missing secret/token)'
                    }
                };
            }
        }
    },

    general: {
        info: function info(req) {
            return {
                janus: 'server_info',
                transaction: req.transaction,
                name: 'Janus WebRTC Gateway',
                version: 11,
                version_string: '0.1.1',
                author: 'Meetecho s.r.l.',
                'log-to-stdout': 'true',
                'log-to-file': 'false',
                data_channels: 'true',
                'server-name': 'MyJanusInstance',
                'local-ip': '192.168.0.166',
                ipv6: 'false',
                'ice-tcp': 'true',
                api_secret: 'false',
                auth_token: 'false',
                transports:
                { 'janus.transport.rabbitmq':
                { name: 'JANUS RabbitMQ transport plugin',
                    author: 'Meetecho s.r.l.',
                    description: 'This transport plugin adds RabbitMQ support to the Janus API via rabbitmq-c.',
                    version_string: '0.0.1',
                    version: 1 },
                    'janus.transport.http':
                    { name: 'JANUS REST (HTTP/HTTPS) transport plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This transport plugin adds REST (HTTP/HTTPS) support to the Janus API via libmicrohttpd.',
                        version_string: '0.0.2',
                        version: 2 },
                    'janus.transport.websockets':
                    { name: 'JANUS WebSockets transport plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This transport plugin adds WebSockets support to the Janus API via libwebsockets.',
                        version_string: '0.0.1',
                        version: 1 },
                    'janus.transport.pfunix':
                    { name: 'JANUS Unix Sockets transport plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This transport plugin adds Unix Sockets support to the Janus API.',
                        version_string: '0.0.1',
                        version: 1 } },
                plugins:
                { 'janus.plugin.audiobridge':
                { name: 'JANUS AudioBridge plugin',
                    author: 'Meetecho s.r.l.',
                    description: 'This is a plugin implementing an audio conference bridge for Janus, mixing Opus streams.',
                    version_string: '0.0.8',
                    version: 8 },
                    'janus.plugin.voicemail':
                    { name: 'JANUS VoiceMail plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This is a plugin implementing a very simple VoiceMail service for Janus, recording Opus streams.',
                        version_string: '0.0.6',
                        version: 6 },
                    'janus.plugin.echotest':
                    { name: 'JANUS EchoTest plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This is a trivial EchoTest plugin for Janus, just used to showcase the plugin interface.',
                        version_string: '0.0.6',
                        version: 6 },
                    'janus.plugin.recordplay':
                    { name: 'JANUS Record&Play plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This is a trivial Record&Play plugin for Janus, to record WebRTC sessions and replay them.',
                        version_string: '0.0.3',
                        version: 3 },
                    'janus.plugin.videoroom':
                    { name: 'JANUS VideoRoom plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This is a plugin implementing a videoconferencing SFU (Selective Forwarding Unit) for Janus, that is an audio/video router.',
                        version_string: '0.0.6',
                        version: 6 },
                    'janus.plugin.videocall':
                    { name: 'JANUS VideoCall plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This is a simple video call plugin for Janus, allowing two WebRTC peers to call each other through the gateway.',
                        version_string: '0.0.5',
                        version: 5 },
                    'janus.plugin.streaming':
                    { name: 'JANUS Streaming plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This is a streaming plugin for Janus, allowing WebRTC peers to watch/listen to pre-recorded files or media generated by gstreamer.',
                        version_string: '0.0.5',
                        version: 5 },
                    'janus.plugin.sip':
                    { name: 'JANUS SIP plugin',
                        author: 'Meetecho s.r.l.',
                        description: 'This is a simple SIP plugin for Janus, allowing WebRTC peers to register at a SIP server and call SIP user agents through the gateway.',
                        version_string: '0.0.6',
                        version: 6 } } };
        },
        ack: function ack(req) {
            return {
                janus: 'ack',
                session_id: req.session_id,
                transaction: req.transaction
            }
        }
    },

    session: {
        create: function create(req) {
            return { janus: 'success',
                transaction: req.transaction,
                data: { id: 1424579626 } };
        },
        destroy: function destroy(req) {

            return { janus: 'success',
                transaction: req.transaction,
                data: { id: 1424579626 } };
        },
        keepAlive: function keepAlive(req) {

            return { janus: 'ack',
                session_id: req.session_id,
                transaction: req.transaction }
        },
        createVideoRoomHandle: function createVideoRoomHandle(req, handle) {

            return { janus: 'success',
                session_id: req.session_id,
                transaction: req.transaction,
                data: { id: handle } };
        }
    },

    handle: {
        trickle: function detach(req) {
            return { janus: 'ack',
                session_id: req.session_id,
                transaction: req.transaction}
        },
        detach: function detach(req) {
            return { janus: 'success',
                session_id: req.session_id,
                transaction: req.transaction}
        },
        hangup: function hangup(req) {
            return { janus: 'success',
                session_id: req.session_id,
                transaction: req.transaction}
        }
    },

    videoRoomHandle: {
        error: {
            destroy: function destroy(req) {
                return { janus: 'success',
                    session_id: req.session_id,
                    sender: req.handle_id,
                    transaction: req.transaction,
                    plugindata:
                    { plugin: 'janus.plugin.videoroom',
                        data:
                        { videoroom: 'event',
                            error_code: 426,
                            error: 'No such room (' + req.body.room + ')' } } };
            }
        },
        create: function create(req) {
            return { janus: 'success',
                session_id: req.session_id,
                sender: req.handle_id,
                transaction: req.transaction,
                plugindata:
                { plugin: 'janus.plugin.videoroom',
                    data: { videoroom: 'created', room: 2146929290 } } }
        },
        destroy: function destroy(req) {
            return { janus: 'success',
                session_id: req.session_id,
                sender: req.handle_id,
                transaction: req.transaction,
                plugindata:
                { plugin: 'janus.plugin.videoroom',
                    data: { videoroom: 'destroyed', room: 2146929290 } } }
        },
        exists: function exists(req) {
            return {
                janus: 'success',
                session_id: req.session_id,
                sender: req.handle_id,
                transaction: req.transaction,
                plugindata: {
                    plugin: 'janus.plugin.videoroom',
                    data: {
                        videoroom: 'success', room: 2146929290, exists: 'true'
                    }
                }
            }
        },
        list: function list(req) {
            return {
                janus: 'success',
                session_id: req.session_id,
                sender: req.handle_id,
                transaction: req.transaction,
                plugindata:
                { plugin: 'janus.plugin.videoroom',
                    data: { videoroom: 'success', list: [
                        { room: 2146929290,
                            description: 'Room 1790787516',
                            max_publishers: 3,
                            bitrate: 0,
                            fir_freq: 0,
                            audiocodec: 'opus',
                            videocodec: 'vp8',
                            record: 'false',
                            num_participants: 0 }
                    ] } } }
        },
        listParticipants: function(req) {
            return { janus: 'success',
                session_id: req.session_id,
                sender: req.handle_id,
                transaction: req.transaction,
                plugindata:
                { plugin: 'janus.plugin.videoroom',
                    data:
                    { videoroom: 'participants',
                        room: req.body.room,
                        participants: [
                            {
                                id: 1,
                                publisher: true
                            },
                            {
                                id: 2,
                                publisher: 'true'
                            }
                        ] } } };
        },
        join: function join(req) {

            switch(req.body.ptype) {
                case 'publisher':
                    return {
                        janus: 'event',
                        session_id: req.session_id,
                        sender: req.handle_id,
                        transaction: req.transaction,
                        plugindata: {
                            plugin: 'janus.plugin.videoroom',
                            data: {
                                videoroom: 'joined',
                                room: req.body.room,
                                description: 'Room ' + req.body.room,
                                id: 1269651309,
                                publishers: []
                            }
                        }
                    };
                case 'listener':
                    return {
                        janus: 'event',
                        session_id: req.session_id,
                        sender: req.handle_id,
                        transaction: req.transaction,
                        plugindata: {
                            plugin: 'janus.plugin.videoroom',
                            data: {
                                videoroom: 'attached',
                                room: req.body.room,
                                id: 982595215
                            }
                        },
                        jsep: {
                            type: 'offer',
                            sdp: 'v=0\r\no=- 1478603918984998 1478603918984997 IN IP4 192.168.0.166\r\ns=Room 1373398250\r\nt=0 0\r\na=ice-lite\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS janus\r\nm=audio 1 RTP/SAVPF 111\r\nc=IN IP4 192.168.0.166\r\na=mid:audio\r\na=sendonly\r\na=rtcp-mux\r\na=ice-ufrag:qPYE\r\na=ice-pwd:QNSr/4swPap0JAW/3thoim\r\na=ice-options:trickle\r\na=fingerprint:sha-256 D2:B9:31:8F:DF:24:D8:0E:ED:D2:EF:25:9E:AF:6F:B8:34:AE:53:9C:E6:F3:8F:F2:64:15:FA:E8:7F:53:2D:38\r\na=setup:actpass\r\na=connection:new\r\na=rtpmap:111 opus/48000/2\r\na=ssrc:552031021 cname:janusaudio\r\na=ssrc:552031021 msid:janus janusa0\r\na=ssrc:552031021 mslabel:janus\r\na=ssrc:552031021 label:janusa0\r\na=candidate:1 1 udp 2013266431 192.168.0.166 34190 typ host\r\na=candidate:2 1 tcp 1019216383 192.168.0.166 0 typ host tcptype active\r\na=candidate:3 1 tcp 1015022079 192.168.0.166 28666 typ host tcptype passive\r\na=candidate:1 2 udp 2013266430 192.168.0.166 26395 typ host\r\na=candidate:2 2 tcp 1019216382 192.168.0.166 0 typ host tcptype active\r\na=candidate:3 2 tcp 1015022078 192.168.0.166 28551 typ host tcptype passive\r\nm=video 1 RTP/SAVPF 100\r\nc=IN IP4 192.168.0.166\r\na=mid:video\r\na=sendonly\r\na=rtcp-mux\r\na=ice-ufrag:EAp8\r\na=ice-pwd:isef237222KQY+VguYZ5nH\r\na=ice-options:trickle\r\na=fingerprint:sha-256 D2:B9:31:8F:DF:24:D8:0E:ED:D2:EF:25:9E:AF:6F:B8:34:AE:53:9C:E6:F3:8F:F2:64:15:FA:E8:7F:53:2D:38\r\na=setup:actpass\r\na=connection:new\r\na=rtpmap:100 VP8/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=ssrc:154813501 cname:janusvideo\r\na=ssrc:154813501 msid:janus janusv0\r\na=ssrc:154813501 mslabel:janus\r\na=ssrc:154813501 label:janusv0\r\na=candidate:4 1 udp 2013266431 192.168.0.166 30530 typ host\r\na=candidate:5 1 tcp 1019216383 192.168.0.166 0 typ host tcptype active\r\na=candidate:6 1 tcp 1015022079 192.168.0.166 33791 typ host tcptype passive\r\na=candidate:4 2 udp 2013266430 192.168.0.166 20569 typ host\r\na=candidate:5 2 tcp 1019216382 192.168.0.166 0 typ host tcptype active\r\na=candidate:6 2 tcp 1015022078 192.168.0.166 31429 typ host tcptype passive\r\n'
                        }
                    }
            }
        }
    }
};
