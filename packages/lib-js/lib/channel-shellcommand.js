

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var PROTOCOLS = require("./protocols");
var CHANNEL = require("./channel");


const HEADER_PREFIX = '#x-wf-';



exports.ShellCommandChannel = function() {
    var ShellCommandChannel = function() {};
    ShellCommandChannel.prototype = CHANNEL.Channel();

    var self = new ShellCommandChannel();

    self.receivers = [];
    self.messageIndex = 0;
    
    self.flush = function(applicator) {
        var messages = this.getOutgoing();
        if(messages.length==0) {
            return 0;
        }
        
        applicator = applicator || this;
    
        applicator.setHeader(HEADER_PREFIX + "protocol-1", "http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1");
        applicator.setHeader(HEADER_PREFIX + "1-1-sender", "http://pinf.org/cadorn.org/wildfire/packages/lib-js");
        applicator.setHeader(HEADER_PREFIX + "1-1-1-receiver", "http://pinf.org/cadorn.org/fireconsole");
        
        // TODO: try and read the last messageIndex from the outgoing headers
                
        for( var i=0 ; i<messages.length ; i++ ) {
            var headers = this.encode(messages[i]);
            for( var j=0 ; j<headers.length ; j++ ) {
                applicator.setHeader(HEADER_PREFIX + "1-index", ""+ headers[j][0]);
                applicator.setHeader(headers[j][1], headers[j][2]);            
            }
        }    
        
    }
    
    self.getMessageIndex = function(increment) {
        increment = increment || 0;
        this.messageIndex += increment;
        return this.messageIndex;
    
    }
    
    self.encode = function(message) {
        var protocol_index = 1;
        var sender_index = 1;
        var receiver_index = 1;
        
        var headers = [];
        
        var meta = message.getMeta() || "";
    
        var data = meta.replace(/\|/g, "\\|") + '|' + message.getData().replace(/\|/g, "\\|");
    
        var parts = chunk_split(data, this.messagePartMaxLength);
    
        var part,
            message_index,
            msg;
        for( var i=0 ; i<parts.length ; i++) {
            if (part = parts[i]) {
    
                message_index = this.getMessageIndex(1);
    
                if (message_index > 99999) {
                    throw new Error('Maximum number (99,999) of messages reached!');
                }
    
                msg = "";
    
                if (parts.length>2) {
                    msg = ((i==0)?data.length:'') +
                          '|' + part + '|' +
                          ((i<parts.length-2)?"\\":"");
                } else {
                    msg = part.length + '|' + part + '|';
                }
    
                headers.push([
                    message_index,
                    HEADER_PREFIX + protocol_index +
                         '-' + sender_index +
                         '-' + receiver_index +
                         '-' + message_index,
                    msg
                ]);
            }
        }
    
        return headers;
    }
    
    
    self.addReceiver = function(receiver) {
        this.receivers.push(receiver);
    }    

    
    self.parseReceived = function(rawHeaders, context) {
        
        if(typeof rawHeaders != "object") {
            rawHeaders = text_header_to_object(rawHeaders);
        }
        
        var protocols = {};
    
        var senders = {};
        var receivers = {};
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
        delete senders;
        delete receivers;
        delete messages;
        
    
        function parseHeader(name, value)
        {
            if (name.substr(0, HEADER_PREFIX.length) == HEADER_PREFIX) {
                if (name.substring(0,HEADER_PREFIX.length + 9) == HEADER_PREFIX + 'protocol-') {
                    var id = parseInt(name.substr(HEADER_PREFIX.length + 9));
                    protocols[id] = PROTOCOLS.factory(value);
                } else {
                    var index = name.indexOf('-',HEADER_PREFIX.length);
                    var id = parseInt(name.substr(HEADER_PREFIX.length,index-HEADER_PREFIX.length));
                    
                    if(protocols[id]) {
                        protocols[id].parseHeader(senders, receivers, messages, name.substr(index+1), value);
                    }
                }
            }
        }
    }

    return self;


    function chunk_split(value, length) {
        var parts = [];
        var part;
        while( (part = value.substr(0, length)) && part.length > 0 ) {
            parts.push(part);
            value = value.substr(length);
        }
        return parts;
    }
    
    function text_header_to_object(text) {
        // trim escape sequence \[0m from beginning if applicable
        if(text.charCodeAt(0)==27 && text.charCodeAt(3)==109) {
            text = text.substring(4);
        }
        var headers = [];
        var lines = text.split("\n");
        var expression = new RegExp("^("+HEADER_PREFIX+"[^:]*): (.*)$", "i");
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
