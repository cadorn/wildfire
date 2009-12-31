
var binding;

exports.setBindingModule = function(id) {
    binding = require(id);
}

exports.getBinding = function() {
    return binding;
}
