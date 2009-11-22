
var ASSERT = require("assert");

var HTTP_HEADER_CHANNEL = require("channel-httpheader");
var DISPATCHER = require("dispatcher");
var MESSAGE = require("message");


exports.testSmall = function() {
    
    var channel = new HttpHeaderChannel();
    
    var dispatcher = new DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = new MESSAGE.Message();
    message.setData("Hello World");
    message.setMeta('{"line":10}');    
    
    dispatcher.dispatch(message);
    dispatcher.dispatch(message);

    channel.flush();

    ASSERT.deepEqual(
        [
            ['x-wf-protocol-1', 'http://meta.wildfirehq.org/Protocol/Component/0.1'],
            ['x-wf-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ['x-wf-1-index', '2'],
            ['x-wf-1-1-1-1', '23|{"line":10}|Hello World|'],
            ['x-wf-1-1-1-2', '23|{"line":10}|Hello World|']
        ],
        channel.getHeaders()
    );
}


exports.testLarge = function() {
    
    var channel = new HttpHeaderChannel();
    channel.setMessagePartMaxLength(10);
    
    var dispatcher = new DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = new MESSAGE.Message();
    
    var data = [];
    for( var i=0 ; i<3 ; i++ ) {
        data.push('line ' + i);
    }
    message.setData(data.join("; "));
    
    dispatcher.dispatch(message);

    channel.flush();

    ASSERT.deepEqual(
        [
            ['x-wf-protocol-1', 'http://meta.wildfirehq.org/Protocol/Component/0.1'],
            ['x-wf-1-1-sender', 'http://pinf.org/cadorn.org/wildfire/packages/lib-js'],
            ['x-wf-1-1-1-receiver', 'http://pinf.org/cadorn.org/fireconsole'],
            ["x-wf-1-index", "6"],
            ["x-wf-1-1-1-1", "23||line 0; l|\\"],
            ["x-wf-1-1-1-2", "|ine 1; lin|"],
            ["x-wf-1-1-1-3", "|e 2|"],
            ["x-wf-1-1-1-4", "23||line 0; l|\\"],
            ["x-wf-1-1-1-5", "|ine 1; lin|"],
            ["x-wf-1-1-1-6", "|e 2|"]
        ],
        channel.getHeaders()
    );
}


var HttpHeaderChannel = exports.HttpHeaderChannel = function() {
    this.headers = [];
}
HttpHeaderChannel.prototype = Object.create(new HTTP_HEADER_CHANNEL.HttpHeaderChannel());
HttpHeaderChannel.prototype.getHeaders = function() {
    return this.headers;
}
HttpHeaderChannel.prototype.setHeader = function(name, value) {

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



if (require.main == module.id)
    require("os").exit(require("test").run(exports));

