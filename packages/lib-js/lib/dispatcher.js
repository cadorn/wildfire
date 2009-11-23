
exports.Dispatcher = function() {
    var Dispatcher = function() {};

    var self = new Dispatcher();

    self.channel = null;

    self.setChannel = function(channel) {
        this.channel = channel;
    }
    
    self.dispatch = function(message) {
        this.channel.enqueueOutgoing(message);
    }

    return self;
}