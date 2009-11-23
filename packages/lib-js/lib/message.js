
exports.Message = function() {
    var Message = function() {};

    var self = new Message();
    
    self.meta = null;
    self.data = null;
    
    self.setSender = function(sender) {
        this.sender = sender;
    }
    
    self.getSender = function() {
        return this.sender;
    }
    
    self.setReceiver = function(receiver) {
        this.receiver = receiver;
    }
    
    self.getReceiver = function() {
        return this.receiver;
    }
    
    self.setMeta = function(meta) {
        this.meta = meta;
    }
    
    self.getMeta = function() {
        return this.meta;
    }
    
    self.setData = function(data) {
        this.data = data;
    }
    
    self.getData = function() {
        return this.data;
    }

    return self;
}