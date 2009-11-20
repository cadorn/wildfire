

function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };


var PROTOCOLS = require("./protocols");


const HEADER_PREFIX = 'x-wf-';


var HttpHeaderChannel = exports.HttpHeaderChannel = function() {
    this.receivers = [];
}


HttpHeaderChannel.prototype.addReceiver = function(receiver) {
    this.receivers.push(receiver);
}    


HttpHeaderChannel.prototype.getFirebugNetMonitorListener = function() {
    if(!this.firebugNetMonitorListener) {
        var self = this;
        this.firebugNetMonitorListener = {
            onResponseBody: function(context, file)
            {
                if(file) {
                    try {
                        self.parseReceived(file.responseHeaders, {
                            "FirebugNetMonitorListener": {
                                "context": context,
                                "file": file
                            }
                        });
                    } catch(e) {
                        print("ERROR: "+e);
                    }
                }
            }
        }
    }
    return this.firebugNetMonitorListener;
}


HttpHeaderChannel.prototype.parseReceived = function(rawHeaders, context) {
    
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
                targetReceivers.push(this.receivers[i]);
            }
        }
        if(targetReceivers.length>0) {
            for( var j=0 ; j<messages[receiverKey].length ; j++ ) {
                // re-write sender and receiver keys to IDs
                messages[receiverKey][j][1].setSender(senders[messages[receiverKey][j][1].getSender()]);
                messages[receiverKey][j][1].setReceiver(receiverId);
                for( var k=0 ; k<targetReceivers.length ; k++ ) {
                    targetReceivers[k].receive(messages[receiverKey][j][1], context);
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
            
            if (name.substr(HEADER_PREFIX.length, 9) == 'protocol-') {
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
