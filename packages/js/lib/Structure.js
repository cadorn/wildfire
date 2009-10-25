
exports.factory = function(uri)
{
    switch(uri)
    {
        case 'http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1':
            return require("./Structures/FirePHP/FirebugConsole-0.1");
    }
    
    return null;
}

