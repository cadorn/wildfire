var WILDFIRE = require("binding/narwhal", "github.com/cadorn/wildfire/raw/master/lib-js");

WILDFIRE.target("http://pinf.org/cadorn.org/fireconsole").send(
    "Meta Data",
    "Message Data"
);

print("Hello World");

WILDFIRE.flush();
