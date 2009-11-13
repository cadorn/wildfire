<?php

abstract class Wildfire_Channel
{    
    private $outgoingQueue = array();



    public abstract function flush();

    public function enqueueOutgoing(Wildfire_Message $message)
    {
        $this->outgoingQueue[] = $message;
        return true;
    }
    
    public function getOutgoing()
    {
        return $this->outgoingQueue;
    }
    
}
