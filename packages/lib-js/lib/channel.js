
var Channel = exports.Channel = function() {
    this.messagePartMaxLength = 5000;
    this.outgoingQueue = [];
}

Channel.prototype.enqueueOutgoing = function(message) {
    this.outgoingQueue.push(message);
    return true;
}

Channel.prototype.getOutgoing = function() {
    return this.outgoingQueue;
}


Channel.prototype.setMessagePartMaxLength = function(length) {
    this.messagePartMaxLength = length;
}
