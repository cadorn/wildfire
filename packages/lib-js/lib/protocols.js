


function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };



var MESSAGE = require("./message");


var protocols = {};

exports.factory = function(uri) {
    if(protocols[uri]) {
        return protocols[uri]();
    }
    return null;
}


    
protocols["http://meta.wildfirehq.org/Protocol/Component/0.1"] = function() {

    var buffers = {};

    return {
        parseHeader: function(senders, receivers, messages, name, value) {
            
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
