Wildfire for Narwhal
====================

*Assumes you are using [this (cadorn/using-packages)](http://github.com/cadorn/narwhal/tree/using-packages) narwhal branch for the new using packages functionality*

Send wildfire messages from narwhal command-line scripts:

    var WILDFIRE = require("binding/narwhal", "wildfire");     
    WILDFIRE.target("http://pinf.org/cadorn.org/fireconsole").send(
        "Meta Data",
        "Message Data"
    );
    print("Hello World");
    WILDFIRE.flush();

You need to have `wildfire` added as a using package:

    "using": {
        "wildfire": {
            "catalog": "http://github.com/cadorn/wildfire/raw/master/catalog.json",
            "name": "lib-js"
        }
    }

Example
-------

*Assumes you are using [this (cadorn/experimental)](http://github.com/cadorn/narwhal/tree/experimental) narwhal branch for the new tusk functionality*

    narwhal script.js

The wildfire messages are sent to *stderr* which a wrapping program may intercept. See the
[unit tests](http://github.com/cadorn/wildfire/blob/master/packages/lib-js/tests/channel-shellcommand.js) for example.