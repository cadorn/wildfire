
var JSON = require("./../../JSON");


var Parser = function()
{
    
    this.parse = function(messages)
    {
        for( var i=0 ; i<messages.length ; i++ ) {
            messages[i][1] = this._parseMessage(messages[i][1]);
        }
        
        return messages;
    };
    
    
    this._parseMessage = function(message)
    {
        try {
            
            return JSON.parse(message);
            
        } catch(e) {
            print(e,'Error parsing message');
        }
    }
}


exports.parse = function(messages)
{
    var parser = new Parser();
    
    return parser.parse(messages);
}
