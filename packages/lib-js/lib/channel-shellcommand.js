
var CHANNEL = require("./channel");

const HEADER_PREFIX = '#x-wf-';

var ShellCommandChannel = exports.ShellCommandChannel = function () {
    if (!(this instanceof exports.ShellCommandChannel))
        return new exports.ShellCommandChannel();
    
    this.__construct();
    
    this.HEADER_PREFIX = HEADER_PREFIX;
}

ShellCommandChannel.prototype = CHANNEL.Channel();
