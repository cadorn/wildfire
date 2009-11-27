
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
    
    self.onMessageGroupStart = function(context) {
        dispatch("onMessageGroupStart", [context]);
    }
    
    self.onMessageGroupEnd = function(context) {
        dispatch("onMessageGroupEnd", [context]);
    }
    
    self.onMessageReceived = function(message, context) {
        dispatch("onMessageReceived", [message, context]);
    }
    
    self.addListener = function(listener) {
        this.listeners.push(listener);
    }
    
    function dispatch(event, arguments) {
        if(self.listeners.length==0) {
            return;
        }
        for( var i=0 ; i<self.listeners.length ; i++ ) {
            if(self.listeners[i][event]) {
                self.listeners[i][event].apply(self.listeners[i], arguments);
            }
        }
    }

    return self;
}