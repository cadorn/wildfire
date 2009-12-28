


function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



var MESSAGE = require("./message");


var parsers = {};
var encoders = {};

exports.getParser = function(uri) {
    if(parsers[uri]) {
        return parsers[uri]();
    }
    return null;
}

exports.getEncoder = function(uri) {
    if(encoders[uri]) {
        return encoders[uri]();
    }
    return null;
}


    
parsers["http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1"] = function() {

    var buffers = {};

    return {
        parse: function(senders, receivers, messages, name, value) {

            var parts = name.split('-');
            // parts[0] - sender
            // parts[1] - receiver
            // parts[2] - message id/index
            
            if(parts[0]=='index') {
                // ignore the index header
                return;
            } else
            if(parts[1]=='sender') {
                senders[parts[0]] = value;
                return;
            } else
            if(parts[2]=='receiver') {
                receivers[parts[0] + ':' + parts[1]] = value;
                return;
            }
            
            // 62|...|\
            var m = value.match(/^(\d*)?\|(.*)\|(\\)?$/);
    
            // length present and message matches length - complete message
            if(m[1] && m[1]==m[2].length && !m[3]) {
                enqueueMessage(parts[2], parts[0], parts[1], m[2]);
            } else
            // message continuation present - message part
            if( m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], (m[1])?'first':'part', m[1]);
            } else
            // no length and no message continuation - last message part
            if( !m[1] && !m[3] ) {
                enqueueBuffer(parts[2], parts[0], parts[1], m[2], 'last');
            } else {
                throw new Error('Error parsing message!');
            }
            
            // this supports message parts arriving in any order as fast as possible
            function enqueueBuffer(index, sender, receiver, value, position, length) {
                var key = sender + ':' + receiver;
                if(!buffers[key]) {
                    buffers[key] = {"firsts": 0, "lasts": 0, "messages": []};
                }
                if(position=="first") buffers[key].firsts += 1;
                else if(position=="last") buffers[key].lasts += 1;
                buffers[key].messages.push([index, value, position, length]);
                
                // if we have a mathching number of first and last parts we assume we have
                // a complete message so we try and join it
                if(buffers[key].firsts>0 && buffers[key].firsts==buffers[key].lasts) {
                    // first we sort all messages
                    buffers[key].messages.sort(
                        function (a, b) {
                            return a[0] - b[0];
                        }
                    );
                    // find the first "first" part and start collecting parts
                    // until "last" is found
                    var startIndex = null;
                    var buffer = null;
                    for( i=0 ; i<buffers[key].messages.length ; i++ ) {
                        if(buffers[key].messages[i][2]=="first") {
                            startIndex = i;
                            buffer = buffers[key].messages[i][1];
                        } else
                        if(startIndex!==null) {
                            buffer += buffers[key].messages[i][1];
                            if(buffers[key].messages[i][2]=="last") {
                                // if our buffer matches the message length
                                // we have a complete message
                                if(buffer.length==buffers[key].messages[startIndex][3]) {
                                    // message is complete
                                    enqueueMessage(buffers[key].messages[startIndex][0], sender, receiver, buffer);
                                    buffers[key].messages.splice(startIndex, i-startIndex);
                                    buffers[key].firsts -= 1;
                                    buffers[key].lasts -= 1;
                                    if(buffers[key].messages.length==0) delete buffers[key];
                                    startIndex = null;
                                    buffer = null;
                                } else {
                                    // message is not complete
                                }
                            }
                        }
                    }
                }
            }
            
            function enqueueMessage(index, sender, receiver, value) {
                
                if(!messages[sender + ':' + receiver]) {
                    messages[sender + ':' + receiver] = [];
                }
                
                var m = /^(.*?[^\\])?\|(.*)$/.exec(value);

                var message = MESSAGE.Message();
                message.setSender(sender);
                message.setReceiver(receiver);
                message.setMeta(m[1] || null);
                message.setData(m[2]);
                
                messages[sender + ':' + receiver].push([index, message]);
            }
        }
    };
};


encoders["http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1"] = function() {

    function chunk_split(value, length) {
        var parts = [];
        var part;
        while( (part = value.substr(0, length)) && part.length > 0 ) {
            parts.push(part);
            value = value.substr(length);
        }
        return parts;
    }

    return {
        
        encodeMessage: function(options, message) {
                  
            var protocol_id = message.getProtocol();
            if(!protocol_id) {
                throw new Error("Protocol not set for message");
            }
            var sender_id = message.getSender();
            if(!sender_id) {
                throw new Error("Sender not set for message");
            }
            var receiver_id = message.getReceiver();
            if(!receiver_id) {
                throw new Error("Receiver not set for message");
            }
            
            var headers = [];
            
            var meta = message.getMeta() || "";
        
            var data = meta.replace(/\|/g, "\\|") + '|' + message.getData().replace(/\|/g, "\\|");
        
            var parts = chunk_split(data, options.messagePartMaxLength);
        
            var part,
                msg;
            for( var i=0 ; i<parts.length ; i++) {
                if (part = parts[i]) {
        
                    msg = "";
        
                    if (parts.length>2) {
                        msg = ((i==0)?data.length:'') +
                              '|' + part + '|' +
                              ((i<parts.length-2)?"\\":"");
                    } else {
                        msg = part.length + '|' + part + '|';
                    }
        
                    headers.push([
                        protocol_id,
                        sender_id,
                        receiver_id,
                        msg
                    ]);
                }
            }
            return headers;
        },
        
        encodeKey: function(util, sender, receiver) {
            
            if(!util["protocols"]) util["protocols"] = {};
            if(!util["messageIndexes"]) util["messageIndexes"] = {};
            if(!util["senders"]) util["senders"] = {};
            if(!util["receivers"]) util["receivers"] = {};

            var protocol = getProtocolIndex("http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1");
            var messageIndex = getMessageIndex(protocol);
            var sender = getSenderIndex(protocol, sender);
            var receiver = getReceiverIndex(protocol, sender, receiver);
            
            return util.HEADER_PREFIX + protocol + "-" + sender + "-" + receiver + "-" + messageIndex;
        
            function getProtocolIndex(protocolId) {
                if(util["protocols"][protocolId]) return util["protocols"][protocolId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + "protocol-" + i);
                    if(!value) {
                        util["protocols"][protocolId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + "protocol-" + i, protocolId);
                        return i;
                    } else
                    if(value==protocolId) {
                        util["protocols"][protocolId] = i;
                        return i;
                    }
                }
            }
        
            function getMessageIndex(protocolIndex) {
                var value = util["messageIndexes"][protocolIndex] || util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-index");
                if(!value) {
                    value = 0;
                }
                value++;
                util["messageIndexes"][protocolIndex] = value;
                util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-index", value);
                return value;
            }
            
            function getSenderIndex(protocolIndex, senderId) {
                if(util["senders"][protocolIndex + ":" + senderId]) return util["senders"][protocolIndex + ":" + senderId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + i + "-sender");
                    if(!value) {
                        util["senders"][protocolIndex + ":" + senderId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + i + "-sender", senderId);
                        return i;
                    } else
                    if(value==senderId) {
                        util["senders"][protocolIndex + ":" + senderId] = i;
                        return i;
                    }
                }
            }
            
            function getReceiverIndex(protocolIndex, senderIndex, receiverId) {
                if(util["receivers"][protocolIndex + ":" + senderIndex + ":" + receiverId]) return util["receivers"][protocolIndex + ":" + senderIndex + ":" + receiverId];
                for( var i=1 ; ; i++ ) {
                    var value = util.applicator.getMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + senderIndex + "-" + i + "-receiver");
                    if(!value) {
                        util["receivers"][protocolIndex + ":" + senderIndex + ":" + receiverId] = i;
                        util.applicator.setMessagePart(util.HEADER_PREFIX + protocolIndex + "-" + senderIndex + "-" + i + "-receiver", receiverId);
                        return i;
                    } else
                    if(value==receiverId) {
                        util["receivers"][protocolIndex + ":" + senderIndex + ":" + receiverId] = i;
                        return i;
                    }
                }
            }
        }
    };
};
