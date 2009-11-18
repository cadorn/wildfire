
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var Receiver = exports.Receiver = function() {
    this.listeners = [];
}

Receiver.prototype.setId = function(id) {
    this.id = id;
}

Receiver.prototype.getId = function() {
    return this.id;
}

Receiver.prototype.receive = function(message, context) {
    if(this.listeners.length==0) {
        return;
    }
    for( var i=0 ; i<this.listeners.length ; i++ ) {
        if(this.listeners[i]["onMessageReceived"]) {
            this.listeners[i].onMessageReceived(message, context);
        }
    }
}

Receiver.prototype.addListener = function(listener) {
    this.listeners.push(listener);
}
