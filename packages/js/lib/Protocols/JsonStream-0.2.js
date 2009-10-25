
var Envolope = require("./../Envelope");

var Structure = require("./../Structure");


var Parser = function()
{
    this.structures = {};
    this.plugins = {};
    this.messages = {};
    
    this.parse = function(headers)
    {
        for (var i =0 ; i<headers.length ; i++ ) {
            this._parseHeader(headers[i][0], headers[i][1]);
        }

        // Sort all messages for each structure and combine all split messages
        for( var structureID in this.messages ) {
            this.messages[structureID] = this._sortMessages(this.messages[structureID]);
            this.messages[structureID] = this._joinMessages(this.messages[structureID]);
            this.messages[structureID] = Structure.factory(this.structures[structureID]).parse(this.messages[structureID]);
        }
        
        var envelope = Envolope.Envelope();
        
        envelope.setStructures(this.structures);
        envelope.setPlugins(this.plugins);
        envelope.setMessages(this.messages);
        
        delete this.structures, this.plugins, this.messages;

        return envelope;        
    };
    
    this._parseHeader = function(name, value)
    {
        var parts = name.split('-');

        if(parts[0]=='structure') {
            if(!this.structures[parts[1]]) {
                this.structures[parts[1]] = value;
            }
        } else
        if(parts[0]=='plugin') {
            if(!this.plugins[parts[1]]) {
                this.plugins[parts[1]] = value;
            }
        } else
        if(parts[0]=='index') {
          
          // Skip this for now
          
        } else {
            // parts[0] - Structure
            // parts[1] - Plugin
            // parts[2] - Message ID
    
            if(!this.messages[parts[0]]) {
                this.messages[parts[0]] = {};
            }

            this.messages[parts[0]][parts[2]] = [parts[1], value];
        }
    };
    
    this._sortMessages = function(messagesIn)
    {
        var keys = [];

        for( var k in messagesIn ) {
             keys.push(k);
        }
        
        keys.sort(
            function (a, b) { 
                return a - b;
            }
        );
        
        var messages = {};
        for (var i = 0; i < keys.length; i++) {
            messages[keys[i]] = messagesIn[keys[i]];
        }    
        return messages;
    };
    
    this._joinMessages = function(messagesIn)
    {
        var buffer = new Array();
        var messages = [];
        
        for( var index in messagesIn ) {
    
            // 62|...|\
            var m = messagesIn[index][1].match(/^(\d*)?\|(.*)\|(\\)?$/);
    
            // length present and message matches length - complete message
            if(m[1] && m[1]==m[2].length && !m[3]) {
                
                messages.push([messagesIn[index][0],m[2]]); 
    
            } else
            // message continuation present - message part
            if( m[3] ) {
    
              buffer.push(buffer.join('') + m[2]);
                
            } else
            // no length and no message continuation - last message part
            if( !m[1] && !m[3] ) {
    
                messages.push([messagesIn[index][0], buffer.join('') + m[2]]); 
    
                buffer = new Array();
            
            } else {
                throw new Error('Error parsing message!');
            }
        }
        return messages;  
    }
}


exports.parse = function(headers)
{
    var parser = new Parser();
    
    return parser.parse(headers);
}


