
exports.testHttpHeaderChannel = require("./channel-httpheader");

if (require.main == module)
    require("os").exit(require("test").run(exports));

