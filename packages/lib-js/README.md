
JavaScript Library for Wildfire
===============================

Use this library to send and receive wildfire messages with JavaScript.

Usage
-----

Receiving HTTP header messages:

    var WILDFIRE = require("wildfire", "wildfire");
    
    var receiver = WILDFIRE.Receiver();
    receiver.setId("<Receiver URI which is typically a URL>");
    receiver.addListener({
        onMessageReceived: function(context, message) {
            var meta = message.getMeta();
            var data = message.getData();
        }
    });

    var channel = WILDFIRE.HttpHeaderChannel();
    channel.addReceiver(receiver);

    // Run received headers through:
    channel.parseReceived([
        { "name": "x-wf-...", "value": "..."},
        { "name": "...", "value": "..."}
    ], context);

Sending HTTP header messages:

    var WILDFIRE = require("wildfire", "wildfire");

    var channel = WILDFIRE.HttpHeaderChannel();
    
    var dispatcher = WILDFIRE.Dispatcher();
    dispatcher.setChannel(channel);
    dispatcher.setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1');
    dispatcher.setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-js');
    dispatcher.setReceiver('http://pinf.org/cadorn.org/fireconsole');
    
    var message = WILDFIRE.Message();
    message.setData("Hello World");
    message.setMeta('{"line":10}');    
    
    dispatcher.dispatch(message);

    // Flush headers via:
    channel.flush({
        setMessagePart: function(key, value) {
            // set (always overwrite) headers on response object
        },
        getMessagePart: function(key) {
            // return header set at name on response object
        }
    });


Examples
--------

  * [Narwhal](http://github.com/cadorn/wildfire/tree/master/packages/lib-js/examples/narwhal/)


Testing
-------

    phpunit tests



License
=======

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Copyright (c) 2009 Christoph Dorn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
