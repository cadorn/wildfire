
var SYSTEM = require("system");
var CHANNEL = require("../channel-shellcommand");
var DISPATCHER = require("../dispatcher");
var MESSAGE = require("../message");

var channel = CHANNEL.ShellCommandChannel();
var dispatcher = DISPATCHER.Dispatcher();
dispatcher.setChannel(channel);

exports.flush = function() {
    var buffer = {};
    channel.flush({
        setHeader: function(name, value) {
            buffer[name] = value;
        }
    });
    for( var key in buffer ) {
        SYSTEM.stderr.write(key + ": " + buffer[key] + "\n");
    }
    SYSTEM.stderr.flush();
}

var api = {
    send: function(data, meta) {
        var message = new MESSAGE.Message();
        message.setData(meta || "");
        message.setMeta(data);    
        dispatcher.dispatch(message);
    }
}

exports.getAPI = function() {
    return api;
}
