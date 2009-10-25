

var Envelope = function()
{
    this.structures = {};
    this.plugins = {};
    this.messages = null;
    
    this.setStructures = function(structures) {
        for( var id in structures ) {
            this.structures[id] = structures[id];
            this.structures[structures[id]] = id;
        }
    }

    this.setPlugins = function(plugins) {
        for( var id in plugins ) {
            this.plugins[id] = plugins[id];
            this.plugins[plugins[id]] = id;
        }
    }

    this.setMessages = function(messages) {
        this.messages = messages;
    }
    
    this.getMessagesFor = function(componentURI, structureURI)
    {
        var messages = [];
        for( var structureID in this.messages ) {
            if (structureID == this.structures[structureURI]) {
                for (var i = 0; i < this.messages[structureID].length; i++) {
                    if (this.messages[structureID][i][0] == this.plugins[componentURI]) {
                        messages.push(this.messages[structureID][i][1]);
                    }
                }
            }            
        }
        return messages;
    }
}


exports.Envelope = function()
{
    return new Envelope();
}
