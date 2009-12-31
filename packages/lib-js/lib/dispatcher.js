
var Dispatcher = exports.Dispatcher = function () {
    if (!(this instanceof exports.Dispatcher))
        return new exports.Dispatcher();
    this.channel = null;
}

Dispatcher.prototype.setChannel = function(channel) {
    this.channel = channel;
}

Dispatcher.prototype.setProtocol = function(protocol) {
    this.protocol = protocol;
}

Dispatcher.prototype.setSender = function(sender) {
    this.sender = sender;
}

Dispatcher.prototype.setReceiver = function(receiver) {
    this.receiver = receiver;
}
    
Dispatcher.prototype.dispatch = function(message) {
    if(!message.getProtocol()) message.setProtocol(this.protocol);
    if(!message.getSender()) message.setSender(this.sender);
    if(!message.getReceiver()) message.setReceiver(this.receiver);
    this.channel.enqueueOutgoing(message);
}
