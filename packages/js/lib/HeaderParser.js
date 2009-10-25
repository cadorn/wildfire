
const HEADER_PREFIX = 'x-wf-';

var Protocol = require("./Protocol");


var Parser = function()
{
    this.protocols = {};
    this.buffer = {};


    this.parse = function(headers)
    {
        for( var i in headers ) {
            this._parseHeader(headers[i].name.toLowerCase(), headers[i].value);
        }
        
        var envelopes = [];
        
        for( var id in this.protocols ) {
             
            var protocol = Protocol.factory(this.protocols[id]);

            if(!protocol) {
                throw new Error("Protocol '" + this.protocols[id] + "' not supported!");
            }
            
            envelopes.push(protocol.parse(this.buffer[id]));
        }
        
        return envelopes;
    }

    this._parseHeader = function(name, value)
    {
        if (name.substr(0, HEADER_PREFIX.length) == HEADER_PREFIX) {
            
            if (name.substr(HEADER_PREFIX.length, 9) == 'protocol-') {
                var id = parseInt(name.substr(HEADER_PREFIX.length + 9));
                this.protocols[id] = value;
            } else {
                var index = name.indexOf('-',HEADER_PREFIX.length);
                var id = parseInt(name.substr(HEADER_PREFIX.length,index-HEADER_PREFIX.length));
                
                if(!this.buffer[id]) {
                    this.buffer[id] = [];
                }
                this.buffer[id].push([name.substr(index+1), value]);
            }
        }
    }
}


exports.parse = function(headers)
{
    try {   
        var parser = new Parser();
        
        return parser.parse(headers);
    } catch (e) {
        print(e,'ERROR');
    }
}
