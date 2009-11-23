
exports.main = function(args) {
    
    // Jack is now installed as it is set as a build dependency
    
    print("Examples have been reheated (Jack was installed)");

    // TODO: Provide a way to reheat certain groups of build using packages only rather than all by default

}

if (module.id == require.main)
    exports.main(system.args);
