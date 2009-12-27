var WILDFIRE = require("handler/narwhal", "github.com/cadorn/wildfire/raw/master/lib-js");

WILDFIRE.getAPI().send(
    "Meta Data",
    "Message Data"
);

print("Hello World");

WILDFIRE.flush();
