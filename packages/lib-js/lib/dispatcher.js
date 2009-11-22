

var Dispatcher = exports.Dispatcher = function() {
    this.channel = null;
}


Dispatcher.prototype.setChannel = function(channel) {
    this.channel = channel;
}


Dispatcher.prototype.dispatch = function(message) {
    this.channel.enqueueOutgoing(message);
}
