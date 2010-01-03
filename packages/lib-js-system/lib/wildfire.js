
const WILDFIRE_UID = "github.com/cadorn/wildfire/zipball/master/packages/lib-js";

var binding;

exports.setBindingModule = function(id) {
    binding = require(id);
}

exports.getBinding = function() {
    return binding;
}

exports.getModule = function(id) {
    return require(id, WILDFIRE_UID);
}
