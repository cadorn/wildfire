

exports.Channel = function() {
    var Channel = function() {};

    var self = new Channel();

    self.messagePartMaxLength = 5000;
    self.outgoingQueue = [];

    self.enqueueOutgoing = function(message) {
        this.outgoingQueue.push(message);
        return true;
    }
    
    self.getOutgoing = function() {
        return this.outgoingQueue;
    }
    
    
    self.setMessagePartMaxLength = function(length) {
        this.messagePartMaxLength = length;
    }
    
    return self;
}