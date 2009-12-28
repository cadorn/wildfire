
var HTTP_HEADER_CHANNEL = require("../channel-httpheader");
var DISPATCHER = require("../dispatcher");
var MESSAGE = require("../message");

var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
var dispatcher = DISPATCHER.Dispatcher();
dispatcher.setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1');
dispatcher.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js/lib/handler/jack.js');
dispatcher.setChannel(channel);

exports.Dispatcher = function(app) {
    return function(env) {
        var response = app(env);
        var headerApplicator = {
            setMessagePart: function(name, value) {
                response.headers[name] = value;
            },
            getMessagePart: function(name) {
                if(!response.headers[name]) return null;
                return response.headers[name];
            }
        };
        channel.setMessagePartHandler(headerApplicator);
        channel.flush();
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
