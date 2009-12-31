
var WILDFIRE = require("wildfire/binding/jack");

var App = function(env) {

    WILDFIRE.target("http://pinf.org/cadorn.org/fireconsole").send(
        "Meta Data",
        "Message Data"
    );

    return {
        status : 200,
        headers : {"Content-Type":"text/html"},
        body : ["<p>Open firebug and check the <i>response headers</i> in the <i>Net</i> panel.</p>"]
    };
};

exports.app = require("jack").ContentLength(App);
