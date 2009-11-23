
var HTTP_HEADER_CHANNEL = require("../channel-httpheader");
var DISPATCHER = require("../dispatcher");
var MESSAGE = require("../message");

var channel = HTTP_HEADER_CHANNEL.HttpHeaderChannel();
var dispatcher = DISPATCHER.Dispatcher();
dispatcher.setChannel(channel);

exports.Dispatcher = function(app) {
    return function(env) {
        var response = app(env);
        var headerApplicator = {
            setHeader: function(name, value) {
                response.headers[name] = value;
            }
        };
        channel.flush(headerApplicator);
        return response;
    }
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
