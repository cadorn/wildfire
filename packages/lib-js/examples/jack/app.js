
var JACK = require("jack", "github.com/cadorn/narwhal/raw/experimental/catalogs/jack");
var WILDFIRE = require("handler/jack", "github.com/cadorn/wildfire/raw/master/lib-js");

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
