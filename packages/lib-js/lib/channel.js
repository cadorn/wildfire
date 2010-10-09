
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var PROTOCOL = require("./protocol");
var TRANSPORT = require("./transport");

var Channel = exports.Channel = function () {
    if (!(this instanceof exports.Channel))
        return new exports.Channel();
}

Channel.prototype.__construct = function(options) {
    options = options || {};
    this.receivers = [];
    this.options = {
        "messagePartMaxLength": 5000
    }
    this.outgoingQueue = [];
    
    if(typeof options.enableTransport != "undefined" && options.enableTransport===false) {
        // do not add transport
    } else {
        this.addReceiver(TRANSPORT.newReceiver(this));
    }
}

Channel.prototype.enqueueOutgoing = function(message, bypassReceivers) {
    if(!bypassReceivers) {
        // If a receiver with a matching ID is present on the channel we don't
        // enqueue the message if receiver.onMessageReceived returns FALSE.
        var enqueue = true;
        for( var i=0 ; i<this.receivers.length ; i++ ) {
            if(this.receivers[i].getId()==message.getReceiver()) {
                if(!this.receivers[i].onMessageReceived(null, message)) enqueue = false;
            }
        }
        if(!enqueue) return true;
    }
    this.outgoingQueue.push(this.encode(message));
    return true;
}

Channel.prototype.getOutgoing = function() {
    return this.outgoingQueue;
}

Channel.prototype.clearOutgoing = function() {
    this.outgoingQueue = [];
}

Channel.prototype.setMessagePartMaxLength = function(length) {
    this.options.messagePartMaxLength = length;
}

Channel.prototype.flush = function(applicator, bypassTransport) {

    // set request ID if not set
    if(!applicator.getMessagePart("x-request-id")) {
        applicator.setMessagePart("x-request-id", ""+(new Date().getTime()) + "" + Math.floor(Math.random()*1000+1) );
    }

    var messages = this.getOutgoing();
    if(messages.length==0) {
        return 0;
    }

    var self = this;
    var util = {
        "applicator": applicator,
        "HEADER_PREFIX": self.HEADER_PREFIX
    };

    if(this.transport && !bypassTransport) {
        util.applicator = this.transport.newApplicator(applicator);
    }

    for( var i=0 ; i<messages.length ; i++ ) {
        var headers = messages[i];
        for( var j=0 ; j<headers.length ; j++ ) {
            util.applicator.setMessagePart(
                PROTOCOL.factory(headers[j][0]).encodeKey(util, headers[j][1], headers[j][2]),
                headers[j][3]
            );
        }
    }
    
    var count = messages.length;

    this.clearOutgoing();

    if(util.applicator.flush) {
        util.applicator.flush(this);
    }

    return count;
}

// NOTE: I think this function is not needed and could probably be removed
Channel.prototype.setMessagePart = function(key, value) {
}

// NOTE: I think this function is not needed and could probably be removed
Channel.prototype.getMessagePart = function(key) {
    return null;
}

Channel.prototype.encode = function(message) {
    var protocol_id = message.getProtocol();
    if(!protocol_id) {
        throw new Error("Protocol not set for message");
    }
    return PROTOCOL.factory(protocol_id).encodeMessage(this.options, message);
}

Channel.prototype.setNoReceiverCallback = function(callback) {
    this.noReceiverCallback = callback;
}

Channel.prototype.addReceiver = function(receiver) {
    this.receivers.push(receiver);
}


Channel.prototype.parseReceived = function(rawHeaders, context) {
    var self = this;
    
    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i]["onChannelOpen"]) {
            this.receivers[i].onChannelOpen(context);
        }
    }

    if(typeof rawHeaders != "object") {
        rawHeaders = text_header_to_object(rawHeaders);
    }

    // protocol related
    var protocolBuffers = {};

    // message related
    var buffers = {};
    var protocols = {};
    var receivers = {};
    var senders = {};
    var messages = {};

    // parse the raw headers into messages
    for( var i in rawHeaders ) {
        parseHeader(rawHeaders[i].name.toLowerCase(), rawHeaders[i].value);
    }

    // deliver the messages to the appropriate receivers
    var messageCount = 0;
    for( var protocolId in protocols ) {

        for( var receiverKey in messages[protocolId] ) {
    
            // sort messages by index
            messages[protocolId][receiverKey].sort(function(a, b) {
                if(parseInt(a[0])>parseInt(b[0])) return 1;
                if(parseInt(a[0])<parseInt(b[0])) return -1;
                return 0;
            });
    
            // determine receiver
            var receiverId = receivers[protocolId][receiverKey];
            // fetch receivers that support ID
            var targetReceivers = [];
            for( var i=0 ; i<this.receivers.length ; i++ ) {
                if(this.receivers[i].getId()==receiverId) {
                    if(this.receivers[i]["onMessageGroupStart"]) {
                        this.receivers[i].onMessageGroupStart(context);
                    }
                    targetReceivers.push(this.receivers[i]);
                }
            }
            if(targetReceivers.length>0) {
                for( var j=0 ; j<messages[protocolId][receiverKey].length ; j++ ) {
                    // re-write sender and receiver keys to IDs
                    messages[protocolId][receiverKey][j][1].setSender(senders[protocolId][receiverKey+":"+messages[protocolId][receiverKey][j][1].getSender()]);
                    messages[protocolId][receiverKey][j][1].setReceiver(receiverId);
                    for( var k=0 ; k<targetReceivers.length ; k++ ) {
                        targetReceivers[k].onMessageReceived(context, messages[protocolId][receiverKey][j][1]);
                        messageCount++;
                    }
                }
                for( var k=0 ; k<targetReceivers.length ; k++ ) {
                    if(targetReceivers[k]["onMessageGroupEnd"]) {
                        targetReceivers[k].onMessageGroupEnd(context);
                    }
                }
            } else
            if(this.noReceiverCallback) {
                this.noReceiverCallback(receiverId);
            }
        }
    }

    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i]["onChannelClose"]) {
            this.receivers[i].onChannelClose(context);
        }
    }
    
    // cleanup - does this help with gc?
    delete buffers;
    delete protocols;
    delete receivers;
    delete senders;
    delete messages;


    return messageCount;
    

    function parseHeader(name, value)
    {
        if (name.substr(0, self.HEADER_PREFIX.length) == self.HEADER_PREFIX) {
            if (name.substring(0,self.HEADER_PREFIX.length + 9) == self.HEADER_PREFIX + 'protocol-') {
                var id = parseInt(name.substr(self.HEADER_PREFIX.length + 9));
                protocols[id] = PROTOCOL.factory(value);
            } else {
                var index = name.indexOf('-',self.HEADER_PREFIX.length);
                var id = parseInt(name.substr(self.HEADER_PREFIX.length,index-self.HEADER_PREFIX.length));
                
                if(protocols[id]) {
                    
                    if(typeof buffers[id] == "undefined") {
                        buffers[id] = {};
                    }
                    if(typeof receivers[id] == "undefined") {
                        receivers[id] = {};
                    }
                    if(typeof senders[id] == "undefined") {
                        senders[id] = {};
                    }
                    if(typeof messages[id] == "undefined") {
                        messages[id] = {};
                    }
                    
                    if(protocolBuffers[id]) {
                        protocolBuffers[id].forEach(function(info) {
                            protocols[id].parse(buffers[id], receivers[id], senders[id], messages[id], info[0], info[1]);
                        });
                        delete protocolBuffers[id];
                    }
                    protocols[id].parse(buffers[id], receivers[id], senders[id], messages[id], name.substr(index+1), value);
                } else {
                    if(!protocolBuffers[id]) {
                        protocolBuffers[id] = [];
                    }
                    protocolBuffers[id].push([name.substr(index+1), value]);
                }
            }
        }
    }
    
    function text_header_to_object(text) {
        // trim escape sequences \[...m
//        text = text.replace(/\x1B\x5B[^\x6D]*\x6D/g, "");
        
        if(text.charCodeAt(0)==27 && text.charCodeAt(3)==109) {
            text = text.substring(4);
        }
        var headers = [];
        var lines = text.split("\n");
        
        var expression = new RegExp("^("+self.HEADER_PREFIX+"[^:]*): (.*)$", "i");
        var m;
        for( var i=0 ; i<lines.length ; i++ ) {
            if(lines[i] && (m = expression.exec(lines[i]))) {
                headers.push({
                    "name": m[1],
                    "value": m[2]
                });
            }            
        }
        return headers;
    }
}

Channel.prototype.setTransport = function(transport) {
    this.transport = transport;
}

