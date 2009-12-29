
var SYSTEM = require("system");
var CHANNEL = require("../channel-shellcommand");
var DISPATCHER = require("../dispatcher");
var MESSAGE = require("../message");

var channel = CHANNEL.ShellCommandChannel();
var dispatcher = DISPATCHER.Dispatcher();
dispatcher.setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1');
dispatcher.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js/lib/binding/narwhal.js');

function init() {
    dispatcher.setChannel(channel);
}

exports.setChannel = function(obj) {
    channel = obj;
    init();
}

exports.flush = function() {
    var buffer = {};
    channel.flush({
        setMessagePart: function(name, value) {
            buffer[name] = value;
        },
        getMessagePart: function(name) {
            if(!buffer[name]) return null;
            return buffer[name];
        }
    });
    for( var key in buffer ) {
        SYSTEM.stderr.write(key + ": " + buffer[key] + "\n");
    }
    SYSTEM.stderr.flush();
}

var API = function() {};
API.prototype.send = function(data, meta) {
    var message = new MESSAGE.Message();
    message.setData(meta || "");
    message.setMeta(data);    
    message.setReceiver(this.receiver);
    dispatcher.dispatch(message);
};

exports.target = function(receiver) {
    var api = new API();
    api.receiver = receiver; 
    return api;
}

init();