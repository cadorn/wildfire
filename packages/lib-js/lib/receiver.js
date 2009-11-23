
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


exports.Receiver = function() {
    var Receiver = function() {};

    var self = new Receiver();
    
    self.listeners = [];

    self.setId = function(id) {
        this.id = id;
    }
    
    self.getId = function() {
        return this.id;
    }
    
    self.receive = function(message, context) {
        if(this.listeners.length==0) {
            return;
        }
        for( var i=0 ; i<this.listeners.length ; i++ ) {
            if(this.listeners[i]["onMessageReceived"]) {
                this.listeners[i].onMessageReceived(message, context);
            }
        }
    }
    
    self.addListener = function(listener) {
        this.listeners.push(listener);
    }

    return self;
}