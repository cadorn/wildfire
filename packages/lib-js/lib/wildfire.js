
exports.Receiver = function() {
    return require("./receiver").Receiver();
}

exports.HttpHeaderChannel = function() {
    return require("./channel-httpheader").HttpHeaderChannel();
}
