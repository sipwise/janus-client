'use strict';

var Janus = require('../src/janus').Janus;
var WebSocketServer = require('ws').Server;
var WebServer = require('http').createServer;
var Plugins = require('../src/constants').Plugins;

var server = WebServer();
var webSocketServer = new WebSocketServer({
    server: server
});

server.listen(6000, function(){

    describe('Client', function(){

        /*
        it('should connect', function(done){

            var client = new Client({
                url: 'ws://localhost:6000'
            });

            client.connect();
            client.on('connected', ()=>{
                done();
            });
        });
        */

        it('should create a janus client', function(done){

            this.timeout(6000);

            var janus = new Janus({
                url: 'ws://192.168.99.100:8188'
            });

            var videoRoomPluginInstance = null;
            janus.on('connected', ()=>{
                console.log(janus.getVersion());
                janus.createSession().then((session)=>{
                    return session.createVideoRoomPlugin();
                }).then((videoRoomPlugin)=>{
                    videoRoomPluginInstance = videoRoomPlugin;
                    return videoRoomPluginInstance.create();
                }).then((videoRoom)=>{
                    console.log(videoRoom);
                    return videoRoom.join({
                        jsep: {
                            type: 'offer',
                            sdp: 'v=0\no=- 3778014195707572222 2 IN IP4 127.0.0.1\ns=-\nt=0 0\na=group:BUNDLE audio video\na=msid-semantic: WMS IuDZgxTv72hOf4c0Sp4dOz1bnTsXlhKHQG80\nm=audio 58770 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 126\nc=IN IP4 192.168.0.198\na=rtcp:58773 IN IP4 192.168.0.198\na=candidate:3081437784 1 udp 2122260223 192.168.0.198 58770 typ host generation 0 network-id 3\na=candidate:2218435994 1 udp 2122194687 192.168.99.1 58771 typ host generation 0 network-id 2\na=candidate:2999745851 1 udp 2122129151 192.168.56.1 58772 typ host generation 0 network-id 1\na=candidate:3081437784 2 udp 2122260222 192.168.0.198 58773 typ host generation 0 network-id 3\na=candidate:2218435994 2 udp 2122194686 192.168.99.1 58774 typ host generation 0 network-id 2\na=candidate:2999745851 2 udp 2122129150 192.168.56.1 58775 typ host generation 0 network-id 1\na=candidate:4180213416 1 tcp 1518280447 192.168.0.198 9 typ host tcptype active generation 0 network-id 3\na=candidate:3401144682 1 tcp 1518214911 192.168.99.1 9 typ host tcptype active generation 0 network-id 2\na=candidate:4233069003 1 tcp 1518149375 192.168.56.1 9 typ host tcptype active generation 0 network-id 1\na=candidate:4180213416 2 tcp 1518280446 192.168.0.198 9 typ host tcptype active generation 0 network-id 3\na=candidate:3401144682 2 tcp 1518214910 192.168.99.1 9 typ host tcptype active generation 0 network-id 2\na=candidate:4233069003 2 tcp 1518149374 192.168.56.1 9 typ host tcptype active generation 0 network-id 1\na=ice-ufrag:nOllhv2MTK+OPVca\na=ice-pwd:vzS+woR3AlcgWJjCRXuyB7pD\na=fingerprint:sha-256 8C:C6:01:C7:75:4B:C4:79:D3:9E:2A:91:EE:48:52:EF:4E:B5:1E:FE:2B:49:96:F5:DB:69:E9:38:84:AD:4A:C4\na=setup:actpass\na=mid:audio\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\na=sendrecv\na=rtcp-mux\na=rtpmap:111 opus/48000/2\na=rtcp-fb:111 transport-cc\na=fmtp:111 minptime=10;useinbandfec=1\na=rtpmap:103 ISAC/16000\na=rtpmap:104 ISAC/32000\na=rtpmap:9 G722/8000\na=rtpmap:0 PCMU/8000\na=rtpmap:8 PCMA/8000\na=rtpmap:106 CN/32000\na=rtpmap:105 CN/16000\na=rtpmap:13 CN/8000\na=rtpmap:126 telephone-event/8000\na=maxptime:60\na=ssrc:4014372561 cname:lB9RT6li8dOUYWxB\na=ssrc:4014372561 msid:IuDZgxTv72hOf4c0Sp4dOz1bnTsXlhKHQG80 744d96ab-eb3e-41aa-acda-2bfa89cacd48\na=ssrc:4014372561 mslabel:IuDZgxTv72hOf4c0Sp4dOz1bnTsXlhKHQG80\na=ssrc:4014372561 label:744d96ab-eb3e-41aa-acda-2bfa89cacd48\nm=video 58776 UDP/TLS/RTP/SAVPF 100 101 116 117 96 97 98\nc=IN IP4 192.168.0.198\na=rtcp:58779 IN IP4 192.168.0.198\na=candidate:3081437784 1 udp 2122260223 192.168.0.198 58776 typ host generation 0 network-id 3\na=candidate:2218435994 1 udp 2122194687 192.168.99.1 58777 typ host generation 0 network-id 2\na=candidate:2999745851 1 udp 2122129151 192.168.56.1 58778 typ host generation 0 network-id 1\na=candidate:3081437784 2 udp 2122260222 192.168.0.198 58779 typ host generation 0 network-id 3\na=candidate:2218435994 2 udp 2122194686 192.168.99.1 58780 typ host generation 0 network-id 2\na=candidate:2999745851 2 udp 2122129150 192.168.56.1 58781 typ host generation 0 network-id 1\na=candidate:4180213416 1 tcp 1518280447 192.168.0.198 9 typ host tcptype active generation 0 network-id 3\na=candidate:3401144682 1 tcp 1518214911 192.168.99.1 9 typ host tcptype active generation 0 network-id 2\na=candidate:4233069003 1 tcp 1518149375 192.168.56.1 9 typ host tcptype active generation 0 network-id 1\na=candidate:4180213416 2 tcp 1518280446 192.168.0.198 9 typ host tcptype active generation 0 network-id 3\na=candidate:3401144682 2 tcp 1518214910 192.168.99.1 9 typ host tcptype active generation 0 network-id 2\na=candidate:4233069003 2 tcp 1518149374 192.168.56.1 9 typ host tcptype active generation 0 network-id 1\na=ice-ufrag:nOllhv2MTK+OPVca\na=ice-pwd:vzS+woR3AlcgWJjCRXuyB7pD\na=fingerprint:sha-256 8C:C6:01:C7:75:4B:C4:79:D3:9E:2A:91:EE:48:52:EF:4E:B5:1E:FE:2B:49:96:F5:DB:69:E9:38:84:AD:4A:C4\na=setup:actpass\na=mid:video\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\na=extmap:3 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\na=extmap:4 urn:3gpp:video-orientation\na=sendrecv\na=rtcp-mux\na=rtcp-rsize\na=rtpmap:100 VP8/90000\na=rtcp-fb:100 ccm fir\na=rtcp-fb:100 nack\na=rtcp-fb:100 nack pli\na=rtcp-fb:100 goog-remb\na=rtcp-fb:100 transport-cc\na=rtpmap:101 VP9/90000\na=rtcp-fb:101 ccm fir\na=rtcp-fb:101 nack\na=rtcp-fb:101 nack pli\na=rtcp-fb:101 goog-remb\na=rtcp-fb:101 transport-cc\na=rtpmap:116 red/90000\na=rtpmap:117 ulpfec/90000\na=rtpmap:96 rtx/90000\na=fmtp:96 apt=100\na=rtpmap:97 rtx/90000\na=fmtp:97 apt=101\na=rtpmap:98 rtx/90000\na=fmtp:98 apt=116\na=ssrc-group:FID 3405380226 37764778\na=ssrc:3405380226 cname:lB9RT6li8dOUYWxB\na=ssrc:3405380226 msid:IuDZgxTv72hOf4c0Sp4dOz1bnTsXlhKHQG80 5db10470-35eb-4028-b073-e8081b21c8f6\na=ssrc:3405380226 mslabel:IuDZgxTv72hOf4c0Sp4dOz1bnTsXlhKHQG80\na=ssrc:3405380226 label:5db10470-35eb-4028-b073-e8081b21c8f6\na=ssrc:37764778 cname:lB9RT6li8dOUYWxB\na=ssrc:37764778 msid:IuDZgxTv72hOf4c0Sp4dOz1bnTsXlhKHQG80 5db10470-35eb-4028-b073-e8081b21c8f6\na=ssrc:37764778 mslabel:IuDZgxTv72hOf4c0Sp4dOz1bnTsXlhKHQG80\na=ssrc:37764778 label:5db10470-35eb-4028-b073-e8081b21c8f6\n'
                        }
                    });
                }).then((joined)=>{
                    console.log(joined);
                    done();
                }).catch((err)=>{
                    done(err);
                });
            });

            janus.on('error', (err)=>{
                done(err);
            });

            janus.connect();

            /*
            var client = new Client({
                url: 'ws://192.168.99.100:8188'
            });

            client.connect();
            client.on('connected', ()=>{
                client.createSession().then((res)=>{
                    done();
                }).catch((err)=>{
                    done(err);
                });
            });
            */
        });

        /*
        it('should create a janus session', function(done){

            this.timeout(6000);

            var client = new Client({
                url: 'ws://192.168.99.100:8188'
            });

            client.connect();
            client.on('connected', ()=>{
                client.createSession().then((res)=>{
                    done();
                }).catch((err)=>{
                    done(err);
                });
            });
        });

        it('should get janus gateway info', function(done){

            this.timeout(6000);

            var client = new Client({
                url: 'ws://192.168.99.100:8188'
            });

            client.connect();
            client.on('connected', ()=>{
                client.getInfo().then((res)=>{
                    done();
                }).catch((err)=>{
                    done(err);
                });
            });
        });
        */
    });

    run();
});
