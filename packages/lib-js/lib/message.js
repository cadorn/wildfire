

var Message = exports.Message = function() {}


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

