

exports.Receiver = function() {
    var MODULE = require("./receiver");
    return new MODULE.Receiver();
}

exports.HttpHeaderChannel = function() {
    var MODULE = require("./channel-httpheader");
    return new MODULE.HttpHeaderChannel();
}
