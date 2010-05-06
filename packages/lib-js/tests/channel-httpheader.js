
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var ASSERT = require("assert");
var FILE = require("file");

var PACKAGES = require("packages");
PACKAGES.load([
    system.prefix,
    FILE.Path(module.path).dirname().dirname().valueOf()
]);

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
    message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
    message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js');
    message.setReceiver('http://pinf.org/cadorn.org/fireconsole');
    
    dispatcher.dispatch(message);
    dispatcher.dispatch(message);

    var flusher = new Flusher();
    channel.flush(flusher);

    ASSERT.deepEqual(
        flusher.getMessageParts(),
        [
            ['x-wf-protocol-1', 'http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0'],
            ['x-wf-1-index', '2'],
            ['x-wf-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-1-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-1', '23|{"line":10}|Hello World|'],
            ['x-wf-1-1-1-2', '23|{"line":10}|Hello World|']
        ]
    );
}


exports.testLarge = function() {
    
    var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
    channel.setMessagePartMaxLength(10);
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    dispatcher.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
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
        flusher.getMessageParts(),
        [
            ['x-wf-protocol-1', 'http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0'],
            ["x-wf-1-index", "3"],
            ['x-wf-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-1-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ["x-wf-1-1-1-1", "23||line 0; l|\\"],
            ["x-wf-1-1-1-2", "|ine 1; lin|"],
            ["x-wf-1-1-1-3", "|e 2|"],
        ]
    );
}

exports.testMultipleProtocols = function() {
    
    var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = MESSAGE.Message();
    message.setData("Hello World");
    message.setMeta('{"line":10}');
    message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
    message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js');
    message.setReceiver('http://pinf.org/cadorn.org/fireconsole');

    dispatcher.dispatch(message);

    message.setProtocol('__TEST__');

    dispatcher.dispatch(message);

    var flusher = new Flusher();
    channel.flush(flusher);

    ASSERT.deepEqual(
        flusher.getMessageParts(),
        [
            ['x-wf-protocol-1', 'http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0'],
            ['x-wf-1-index', 1],
            ['x-wf-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-1-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-1', '23|{"line":10}|Hello World|'],
            ['x-wf-protocol-2', '__TEST__'],
            ['x-wf-2-index', 1],
            ['x-wf-2-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-2-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-2-1-1-1', '23|{"line":10}|Hello World|']
        ]
    );
}

exports.testMultipleSenders = function() {
    
    var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = MESSAGE.Message();
    message.setData("Hello World");
    message.setMeta('{"line":10}');
    message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
    message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js');
    message.setReceiver('http://pinf.org/cadorn.org/fireconsole');

    dispatcher.dispatch(message);

    message.setSender('__TEST__');

    dispatcher.dispatch(message);

    var flusher = new Flusher();
    channel.flush(flusher);

    ASSERT.deepEqual(
        flusher.getMessageParts(),
        [
            ['x-wf-protocol-1', 'http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0'],
            ['x-wf-1-index', '2'],
            ['x-wf-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-1-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-1', '23|{"line":10}|Hello World|'],
            ['x-wf-1-1-2-sender', '__TEST__'],
            ['x-wf-1-1-2-2', '23|{"line":10}|Hello World|']
        ]
    );
}

exports.testMultipleReceivers = function() {
    
    var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = MESSAGE.Message();
    message.setData("Hello World");
    message.setMeta('{"line":10}');
    message.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
    message.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js');
    message.setReceiver('http://pinf.org/cadorn.org/fireconsole');

    dispatcher.dispatch(message);

    message.setReceiver('__TEST__');

    dispatcher.dispatch(message);

    var flusher = new Flusher();
    channel.flush(flusher);

    ASSERT.deepEqual(
        flusher.getMessageParts(),
        [
            ['x-wf-protocol-1', 'http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0'],
            ['x-wf-1-index', '2'],
            ['x-wf-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-1-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-1', '23|{"line":10}|Hello World|'],
            ['x-wf-1-2-receiver', '__TEST__'],
            ['x-wf-1-2-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-2-1-2', '23|{"line":10}|Hello World|'],
        ]
    );
}

var Flusher = function() {
    this.parts = [];
};
Flusher.prototype.getMessageParts = function() {
    return this.parts;
}
Flusher.prototype.setMessagePart = function(key, value) {
    // replace headers with same name
    for( var i=0 ; i<this.parts.length ; i++ ) {
        if(this.parts[i][0]==key) {
            this.parts[i][1] = '' + value;
            break;
        }
    }
    // add header if not already found
    if(i==0 || (i==this.parts.length && this.parts[i-1][0]!=key)) {
        this.parts.push([key, value]);
    }
}
Flusher.prototype.getMessagePart = function(key) {
    for( var i=0 ; i<this.parts.length ; i++ ) {
        if(this.parts[i][0]==key) {
            return this.parts[i][1];
        }
    }
    return null;
}

if (require.main == module.id)
    require("os").exit(require("test").run(exports));

