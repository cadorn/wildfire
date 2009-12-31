
var Message = exports.Message = function (dispatcher) {
    if (!(this instanceof exports.Message))
        return new exports.Message(dispatcher);
    
    this.meta = null;
    this.data = null;

    var self = this;
    self.dispatch = function() {
        if(!dispatcher) {
            throw new Error("dispatcher not set");
        }
        return dispatcher.dispatch(self);
    }
}

Message.prototype.setProtocol = function(protocol) {
    this.protocol = protocol;
}

Message.prototype.getProtocol = function() {
    return this.protocol;
}

Message.prototype.setSender = function(sender) {
    this.sender = sender;
}

Message.prototype.getSender = function() {
    return this.sender;
}

Message.prototype.setReceiver = function(receiver) {
    this.receiver = receiver;
}

Message.prototype.getReceiver = function() {
    return this.receiver;
}

Message.prototype.setMeta = function(meta) {
    this.meta = meta;
}

Message.prototype.getMeta = function() {
    return this.meta;
}

Message.prototype.setData = function(data) {
    this.data = data;
}

Message.prototype.getData = function() {
    return this.data;
}
