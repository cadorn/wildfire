
var ASSERT = require("assert");

var HTTP_HEADER_CHANNEL = require("channel-httpheader");
var DISPATCHER = require("dispatcher");
var MESSAGE = require("message");


exports.testSmall = function() {
    
    var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = MESSAGE.Message();
    message.setData("Hello World");
    message.setMeta('{"line":10}');
    message.setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1');
    message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js');
    message.setReceiver('http://pinf.org/cadorn.org/fireconsole');
    
    dispatcher.dispatch(message);
    dispatcher.dispatch(message);

    var flusher = new Flusher();
    channel.flush(flusher);

    ASSERT.deepEqual(
        [
            ['x-wf-protocol-1', 'http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1'],
            ['x-wf-1-index', '2'],
            ['x-wf-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-1-1-1-1', '23|{"line":10}|Hello World|'],
            ['x-wf-1-1-1-2', '23|{"line":10}|Hello World|']
        ],
        flusher.getHeaders()
    );
}


exports.testLarge = function() {
    
    var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
    channel.setMessagePartMaxLength(10);
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    dispatcher.setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1');
    dispatcher.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js');
    dispatcher.setReceiver('http://pinf.org/cadorn.org/fireconsole');
    
    var message = MESSAGE.Message();
    
    var data = [];
    for( var i=0 ; i<3 ; i++ ) {
        data.push('line ' + i);
    }
    message.setData(data.join("; "));
    
    dispatcher.dispatch(message);

    var flusher = new Flusher();
    channel.flush(flusher);

    ASSERT.deepEqual(
        [
            ['x-wf-protocol-1', 'http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1'],
            ["x-wf-1-index", "3"],
            ['x-wf-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ["x-wf-1-1-1-1", "23||line 0; l|\\"],
            ["x-wf-1-1-1-2", "|ine 1; lin|"],
            ["x-wf-1-1-1-3", "|e 2|"],
        ],
        flusher.getHeaders()
    );
}
/*
exports.testMultipleProtocols = function() {
    
    var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = MESSAGE.Message();
    message.setData("Hello World");
    message.setMeta('{"line":10}');
    message.setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1');
    message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js');
    message.setReceiver('http://pinf.org/cadorn.org/fireconsole');

    dispatcher.dispatch(message);

    message.setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.2');

    dispatcher.dispatch(message);

    var flusher = new Flusher();
    channel.flush(flusher);

    ASSERT.deepEqual(
        [
            ['x-wf-protocol-1', 'http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1'],
            ['x-wf-1-index', '1'],
            ['x-wf-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-1-1-1-1', '23|{"line":10}|Hello World|'],
            ['x-wf-protocol-2', 'http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.2'],
            ['x-wf-2-index', '1'],
            ['x-wf-2-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-2-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-2-1-1-1', '23|{"line":10}|Hello World|']
        ],
        flusher.getHeaders()
    );
}
*/
var Flusher = function() {
    this.headers = [];
};
Flusher.prototype.getHeaders = function() {
    return this.headers;
}
Flusher.prototype.setMessagePart = function(name, value) {
    // replace headers with same name
    for( var i=0 ; i<this.headers.length ; i++ ) {
        if(this.headers[i][0]==name) {
            this.headers[i][1] = '' + value;
            break;
        }
    }
    // add header if not already found
    if(i==0 || (i==this.headers.length && this.headers[i-1][0]!=name)) {
        this.headers.push([name, value]);
    }
}
Flusher.prototype.getMessagePart = function(name) {
    for( var i=0 ; i<this.headers.length ; i++ ) {
        if(this.headers[i][0]==name) {
            return this.headers[i][1];
        }
    }
    return null;
}

if (require.main == module.id)
    require("os").exit(require("test").run(exports));

