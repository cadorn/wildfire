
var ASSERT = require("assert");

var HTTP_HEADER_CHANNEL = require("channel-httpheader");
var DISPATCHER = require("dispatcher");
var MESSAGE = require("message");


exports.testSmall = function() {
    
    var channel = HttpHeaderChannel();
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = MESSAGE.Message();
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
    
    var channel = HttpHeaderChannel();
    channel.setMessagePartMaxLength(10);
    
    var dispatcher = DISPATCHER.Dispatcher();
    dispatcher.setChannel(channel);
    
    var message = MESSAGE.Message();
    
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
            ["x-wf-1-index", "3"],
            ["x-wf-1-1-1-1", "23||line 0; l|\\"],
            ["x-wf-1-1-1-2", "|ine 1; lin|"],
            ["x-wf-1-1-1-3", "|e 2|"],
        ],
        channel.getHeaders()
    );
}


var HttpHeaderChannel = function() {
    var HttpHeaderChannel = function() {};
    HttpHeaderChannel.prototype = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
    var self = new HttpHeaderChannel();
    self.headers = [];
    self.getHeaders = function() {
        return this.headers;
    };
    self.setHeader = function(name, value) {
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
    };
    return self;
}


if (require.main == module.id)
    require("os").exit(require("test").run(exports));

