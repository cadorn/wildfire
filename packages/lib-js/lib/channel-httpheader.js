
var CHANNEL = require("./channel");

const HEADER_PREFIX = 'x-wf-';

var HttpHeaderChannel = exports.HttpHeaderChannel = function () {
    if (!(this instanceof exports.HttpHeaderChannel))
        return new exports.HttpHeaderChannel();

    this.__construct();

    this.HEADER_PREFIX = HEADER_PREFIX;
}

HttpHeaderChannel.prototype = CHANNEL.Channel();

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
                        system.log.error(e);
                    }
                }
            }
        }
    }
    return this.firebugNetMonitorListener;
}
