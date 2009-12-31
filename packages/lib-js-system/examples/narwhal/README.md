Wildfire for Narwhal
====================

Install the following [using-packages](http://github.com/280north/narwhal/blob/master/docs/packages-using.md) into your sea:

  * [github.com/cadorn/wildfire/zipball/master/packages/lib-js-system](http://github.com/cadorn/wildfire/tree/master/packages/lib-js-system/)
  * [github.com/cadorn/wildfire/zipball/master/packages/lib-js](http://github.com/cadorn/wildfire/tree/master/packages/lib-js/)

Send wildfire messages from narwhal command-line scripts:

    var WILDFIRE = require("wildfire/binding/narwhal");
    WILDFIRE.target("http://pinf.org/cadorn.org/fireconsole").send(
        "Meta Data",
        "Message Data"
    );
    print("Hello World");
    WILDFIRE.flush();

Example
-------

    narwhal script.js

The wildfire messages are sent to *stderr* which a wrapping program may intercept. See the
[unit tests](http://github.com/cadorn/wildfire/blob/master/packages/lib-js-system/tests/channel-shellcommand.js) for example.