
var Receiver = exports.Receiver = function () {
    if (!(this instanceof exports.Receiver))
        return new exports.Receiver();

    this.listeners = [];
    this.ids = [];
}
    
Receiver.prototype.setId = function(id) {
    if(this.ids.length > 0) {
        throw new Error("ID already set for receiver!");
    }
    this.ids.push(id);
}

Receiver.prototype.addId = function(id) {
    this.ids.push(id);
}

/**
 * @deprecated
 */
Receiver.prototype.getId = function() {
    if(this.ids.length > 1) {
        throw new Error("DEPRECATED: Multiple IDs for receiver. Cannot use getId(). Use getIds() instead!");
    }
    return this.ids[0];
}

Receiver.prototype.getIds = function() {
    return this.ids;
}

Receiver.prototype.hasId = function(id) {
    for( var i=0 ; i<this.ids.length ; i++ ) {
        if(this.ids[i]==id) {
            return true;
        }
    }
    return false;
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
    return this._dispatch("onMessageReceived", [message, context]);
}

Receiver.prototype.addListener = function(listener) {
    this.listeners.push(listener);
}

Receiver.prototype._dispatch = function(event, arguments) {
    if(this.listeners.length==0) {
        return;
    }
    var returnOptions,
        opt;
    for( var i=0 ; i<this.listeners.length ; i++ ) {
        if(this.listeners[i][event]) {
            opt = this.listeners[i][event].apply(this.listeners[i], arguments);
            if(opt) {
                if(!returnOptions) {
                    returnOptions = opt;
                } else {
                    for( var key in opt ) {
                        returnOptions[key] = opt[key];
                    }
                }
            }
        }
    }
    return returnOptions;
}
