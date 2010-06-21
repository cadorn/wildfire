
exports.Receiver = function() {
    return require("./receiver").Receiver();
}

exports.Dispatcher = function() {
    return require("./dispatcher").Dispatcher();
}

exports.Message = function() {
    return require("./message").Message();
}

exports.HttpHeaderChannel = function(options) {
    return require("./channel-httpheader").HttpHeaderChannel(options);
}

exports.ShellCommandChannel = function() {
    return require("./channel-shellcommand").ShellCommandChannel();
}
