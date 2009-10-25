
exports.factory = function(uri)
{
    switch(uri)
    {
        case 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2':
            return require("./Protocols/JsonStream-0.2");
    }
    
    return null;
}

