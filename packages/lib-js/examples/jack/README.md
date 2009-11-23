Wildfire for Jack
=================

*Assumes you are using [this (cadorn/using-packages)](http://github.com/cadorn/narwhal/tree/using-packages) narwhal branch for the new using packages functionality*

Send wildfire messages from jack apps:

    var WILDFIRE = require("handler/jack", "wildfire");
	var App = function(env) {
	    WILDFIRE.getAPI().send(
	        "Message Data",
	        "Meta Data"
	    );
	    return {
	        status : 200,
	        headers : {"Content-Type":"text/html"},
	        body : ["<p>Open firebug and check the <i>response headers</i> in the <i>Net</i> panel.</p>"]
	    };
	};
	exports.app = WILDFIRE.Dispatcher(JACK.ContentLength(App));

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

    tusk package --package lib-js build reheat-examples
    ./server

Browse to: http://127.0.0.1:8080/

Open firebug and check the *response headers* in the *Net* panel.
q