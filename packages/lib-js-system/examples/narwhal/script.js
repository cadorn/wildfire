var WILDFIRE = require("wildfire/binding/narwhal");

WILDFIRE.target("http://pinf.org/cadorn.org/fireconsole").send(
    "Meta Data",
    "Message Data"
);

print("Hello World");

WILDFIRE.flush();
