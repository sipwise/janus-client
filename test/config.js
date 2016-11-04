
process.env.DEBUG = '';

var mockServerPort = 9000;

module.exports.config = {

    janus: {
        server: {
            port: mockServerPort,
            url: 'http://localhost:' + mockServerPort
        }
    }
};
