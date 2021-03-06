
require("wildfire").setBindingModule(module.id);

const WILDFIRE_UID = "github.com/cadorn/wildfire/zipball/master/packages/lib-js";

var HTTP_HEADER_CHANNEL = require("channel-httpheader", WILDFIRE_UID);
var DISPATCHER = require("dispatcher", WILDFIRE_UID);
var MESSAGE = require("message", WILDFIRE_UID);

var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
var dispatcher = DISPATCHER.Dispatcher();
dispatcher.setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
dispatcher.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js-system/lib/wildfire/binding/jack.js');


function init() {
    dispatcher.setChannel(channel);
}

exports.setChannel = function(obj) {
    channel = obj;
    init();
}

exports.getChannel = function() {
    return channel;
}

exports.Dispatcher = function(app) {
    return function(env) {
        var response = app(env);
        channel.flush({
            setMessagePart: function(name, value) {
                response.headers[name] = ""+value;
            },
            getMessagePart: function(name) {
                if(!response.headers[name]) return null;
                return response.headers[name];
            }
        });
        return response;
    }
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

exports.newMessage = function() {
    return new MESSAGE.Message(dispatcher);
}

exports.formatResponse = function(options, data) {
    data = data || "";
    return {
        status: 200,
        headers: {
            "Content-Type": options.contentType,
            "Content-Length": String(data.length)
        },
        body: [data]
    }
}

init();
