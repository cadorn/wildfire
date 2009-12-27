
exports.testHttpHeaderChannel = require("./channel-httpheader");
exports.testShellCommandChannel = require("./channel-shellcommand");

if (require.main == module)
    require("os").exit(require("test").run(exports));

