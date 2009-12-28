
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var PROTOCOLS = require("./protocols");


var Channel = exports.Channel = function () {
    if (!(this instanceof exports.Channel))
        return new exports.Channel();
}

Channel.prototype.__construct = function(message) {
    this.receivers = [];
    this.options = {
        "messagePartMaxLength": 5000
    }
    this.outgoingQueue = [];
}

Channel.prototype.enqueueOutgoing = function(message) {
    // If a receiver with a matching ID is present on the channel we don't
    // enqueue the message if receiver.onMessageReceived returns FALSE.
    var enqueue = true;
    for( var i=0 ; i<this.receivers.length ; i++ ) {
        if(this.receivers[i].getId()==message.getReceiver()) {
            if(!this.receivers[i].onMessageReceived(null, message)) enqueue = false;
        }
    }
    if(!enqueue) return true;
    this.outgoingQueue.push(this.encode(message));
    return true;
}

Channel.prototype.getOutgoing = function() {
    return this.outgoingQueue;
}

Channel.prototype.setMessagePartMaxLength = function(length) {
    this.options.messagePartMaxLength = length;
}

Channel.prototype.flush = function(applicator) {
    var messages = this.getOutgoing();
    if(messages.length==0) {
        return 0;
    }
    
    var self = this;
    var util = {
        "applicator": applicator,
        "HEADER_PREFIX": self.HEADER_PREFIX
    };
            
    for( var i=0 ; i<messages.length ; i++ ) {
        var headers = messages[i];
        for( var j=0 ; j<headers.length ; j++ ) {            
            applicator.setMessagePart(
                PROTOCOLS.getEncoder(headers[j][0]).encodeKey(util, headers[j][1], headers[j][2]),
                headers[j][3]
            );
        }
    }
}

Channel.prototype.setMessagePart = function(name, value) {
}

Channel.prototype.getMessagePart = function(name) {
    return null;
}

Channel.prototype.encode = function(message) {
    var protocol_id = message.getProtocol();
    if(!protocol_id) {
        throw new Error("Protocol not set for message");
    }
    return PROTOCOLS.getEncoder(protocol_id).encodeMessage(this.options, message);
}

Channel.prototype.addReceiver = function(receiver) {
    this.receivers.push(receiver);
}


Channel.prototype.parseReceived = function(rawHeaders, context) {
    var self = this;
    
    if(typeof rawHeaders != "object") {
        rawHeaders = text_header_to_object(rawHeaders);
    }

    var protocols = {};
    var receivers = {};
    var senders = {};
    var messages = {};
    
    // parse the raw headers into messages
    for( var i in rawHeaders ) {
        parseHeader(rawHeaders[i].name.toLowerCase(), rawHeaders[i].value);
    }

    // deliver the messages to the appropriate receivers
    for( var receiverKey in messages ) {
        // determine receiver
        var receiverId = receivers[receiverKey];
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
            for( var j=0 ; j<messages[receiverKey].length ; j++ ) {
                // re-write sender and receiver keys to IDs
                messages[receiverKey][j][1].setSender(senders[messages[receiverKey][j][1].getSender()]);
                messages[receiverKey][j][1].setReceiver(receiverId);
                for( var k=0 ; k<targetReceivers.length ; k++ ) {
                    targetReceivers[k].onMessageReceived(context, messages[receiverKey][j][1]);
                }
            }
            for( var k=0 ; k<targetReceivers.length ; k++ ) {
                if(targetReceivers[k]["onMessageGroupEnd"]) {
                    targetReceivers[k].onMessageGroupEnd(context);
                }
            }
        }
    }
    
    // cleanup
    delete protocols;
    delete receivers;
    delete senders;
    delete messages;
    

    function parseHeader(name, value)
    {
        if (name.substr(0, self.HEADER_PREFIX.length) == self.HEADER_PREFIX) {
            if (name.substring(0,self.HEADER_PREFIX.length + 9) == self.HEADER_PREFIX + 'protocol-') {
                var id = parseInt(name.substr(self.HEADER_PREFIX.length + 9));
                protocols[id] = PROTOCOLS.getParser(value);
            } else {
                var index = name.indexOf('-',self.HEADER_PREFIX.length);
                var id = parseInt(name.substr(self.HEADER_PREFIX.length,index-self.HEADER_PREFIX.length));
                
                if(protocols[id]) {
                    protocols[id].parse(receivers, senders, messages, name.substr(index+1), value);
                }
            }
        }
    }
    
    function text_header_to_object(text) {
        // trim escape sequence \[0m from beginning if applicable
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

