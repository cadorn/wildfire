
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var ASSERT = require("assert");

var OS = require("os");
var FILE = require("file");
var UTIL = require("util");
var CHANNEL = require("channel-shellcommand");
var RECEIVER = require("receiver");
var MESSAGE = require("message");


exports.testScript = function() {
    
    // setup receiver and channel
    var received = [];
    
    var receiver = RECEIVER.Receiver();
    receiver.setId("http://pinf.org/cadorn.org/fireconsole");
    receiver.addListener({
        onMessageReceived: function(context, message) {
            received.push([message.getMeta(), message.getData(), context]);
        }
    });

    var channel = CHANNEL.ShellCommandChannel();
    channel.addReceiver(receiver);
    
    // run script
        
    var command = "narwhal " + FILE.Path(module.path).join("../../examples/narwhal/script.js").canonical().valueOf();
    
    var process = OS.popen(command);
    var result = process.communicate();
    if (result.status !== 0) {
        throw new Error("Error running: " + command);
    }
    
    var stdout = UTIL.trim(result.stdout.read());
    var stderr = UTIL.trim(result.stderr.read());
    
    // process/test result
    
    ASSERT.equal("Hello World", stdout);

    channel.parseReceived(stderr, {
        "command": command
    });

    ASSERT.deepEqual(
        [
            [
                "Meta Data",
                "Message Data",
                {
                    "command": command
                }
            ]
        ],
        received);
}

exports.testInline = function() {
    
    // setup receiver and channel
    var received = [];
    
    var receiver = RECEIVER.Receiver();
    receiver.setId("http://pinf.org/cadorn.org/fireconsole");
    receiver.addListener({
        onMessageReceived: function(context, message) {
            received.push([message.getMeta(), message.getData()]);
            return false;
        }
    });

    var channel = CHANNEL.ShellCommandChannel();
    channel.addReceiver(receiver);
    
    // run inline

    // --- in the parent context
    var WILDFIRE = require("handler/narwhal", "github.com/cadorn/wildfire/raw/master/lib-js");
    
    WILDFIRE.setChannel(channel);
    
    // --- in the client context
    WILDFIRE.target("http://pinf.org/cadorn.org/fireconsole").send(
        "Meta Data",
        "Message Data"
    );
    WILDFIRE.flush();

    // test result
    ASSERT.deepEqual(
        [
            [
                "Meta Data",
                "Message Data"
            ]
        ],
        received);
}

if (require.main == module.id)
    require("os").exit(require("test").run(exports));
