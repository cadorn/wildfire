
var Receiver = exports.Receiver = function () {
    if (!(this instanceof exports.Receiver))
        return new exports.Receiver();

    this.listeners = [];
}
    
Receiver.prototype.setId = function(id) {
    this.id = id;
}

Receiver.prototype.getId = function() {
    return this.id;
}

Receiver.prototype.onChannelOpen = function(context) {
    this._dispatch("onChannelOpen", [context]);
}

Receiver.prototype.onChannelClose = function(context) {
    this._dispatch("onChannelClose", [context]);
}

Receiver.prototype.onMessageGroupStart = function(context) {
    this._dispatch("onMessageGroupStart", [context]);
}

Receiver.prototype.onMessageGroupEnd = function(context) {
    this._dispatch("onMessageGroupEnd", [context]);
}

Receiver.prototype.onMessageReceived = function(message, context) {
    this._dispatch("onMessageReceived", [message, context]);
}

Receiver.prototype.addListener = function(listener) {
    this.listeners.push(listener);
}

Receiver.prototype._dispatch = function(event, arguments) {
    if(this.listeners.length==0) {
        return;
    }
    for( var i=0 ; i<this.listeners.length ; i++ ) {
        if(this.listeners[i][event]) {
            this.listeners[i][event].apply(this.listeners[i], arguments);
        }
    }
}
