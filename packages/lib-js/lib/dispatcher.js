
exports.Dispatcher = function() {
    var Dispatcher = function() {};

    var self = new Dispatcher();

    self.channel = null;

    self.setChannel = function(channel) {
        this.channel = channel;
    }

    self.setProtocol = function(protocol) {
        this.protocol = protocol;
    }
    
    self.setSender = function(sender) {
        this.sender = sender;
    }
    
    self.setReceiver = function(receiver) {
        this.receiver = receiver;
    }
        
    self.dispatch = function(message) {
        if(!message.getProtocol()) message.setProtocol(this.protocol);
        if(!message.getSender()) message.setSender(this.sender);
        if(!message.getReceiver()) message.setReceiver(this.receiver);
        this.channel.enqueueOutgoing(message);
    }

    return self;
}