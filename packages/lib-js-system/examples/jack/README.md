Wildfire for Jack
=================

Install the following [using-packages](http://github.com/280north/narwhal/blob/master/docs/packages-using.md) into your sea:

  * [github.com/cadorn/wildfire/zipball/master/packages/lib-js-system](http://github.com/cadorn/wildfire/tree/master/packages/lib-js-system/)
  * [github.com/cadorn/wildfire/zipball/master/packages/lib-js](http://github.com/cadorn/wildfire/tree/master/packages/lib-js/)

Send wildfire messages from jack apps:

    var WILDFIRE = require("wildfire/binding/jack");
	var App = function(env) {
	    WILDFIRE.target("http://pinf.org/cadorn.org/fireconsole").send(
	        "Message Data",
	        "Meta Data"
	    );
	    return {
	        status : 200,
	        headers : {"Content-Type":"text/html"},
	        body : ["<p>Open firebug and check the <i>response headers</i> in the <i>Net</i> panel.</p>"]
	    };
	};
	exports.app = require("jack").ContentLength(App);

Example
-------

*Assumes you are using [this (cadorn/experimental)](http://github.com/cadorn/narwhal/tree/experimental) narwhal branch for extra tusk functionality*

    tusk package --package lib-js-system build reheat-examples
    ./server

Browse to: http://127.0.0.1:8080/

Open firebug and check the *response headers* in the *Net* panel.
