<?php

class Wildfire_Dispatcher
{
    
    private $channel = null;
    
    
    
    public function setChannel($channel)
    {
        $this->channel = $channel;
    }
    
    public function dispatch(Wildfire_Message $message)
    {
        $this->channel->enqueueOutgoing($message);
    }
}
