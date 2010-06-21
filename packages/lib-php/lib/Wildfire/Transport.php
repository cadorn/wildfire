<?php

require_once('Wildfire/Message.php');

abstract class Wildfire_Transport
{
    const RECEIVER_ID = "http://registry.pinf.org/cadorn.org/wildfire/@meta/receiver/transport/0";
    
    protected $buffer = array();


    public function getMessagePart($key)
    {
        if(!isset($this->buffer[$key])) {
            return null;
        }
        return $this->buffer[$key];
    }

    public function setMessagePart($key, $value)
    {
        $this->buffer[$key] = $value;
    }
    
    public function flush($channel)
    {
        $data = array();
        $seed = array();
    
        // combine all message parts into one text block
        foreach( $this->buffer as $key => $value ) {
            $data[] = $key . ": " . $value;
            if(count($data) % 3 == 0 && count($seed) < 5) $seed[] = $value;
        }
        
        // generate a key for the text block
        $key = md5(uniqid() . ":" . implode("", $seed));
    
        // store the text block for future access
        $this->setData($key, implode("\n", $data));
        
        // create a pointer message to be sent instead of the original messages
        $message = new Wildfire_Message();

        $message->setProtocol('http://registry.pinf.org/cadorn.org/wildfire/@meta/protocol/component/0.1.0');
        $message->setSender('http://registry.pinf.org/cadorn.org/wildfire/packages/lib-php/lib/Wildfire/Transport.php');
        $message->setReceiver(self::RECEIVER_ID);
        $message->setData(json_encode($this->getPointerData($key)));

        // send the pointer message through the channel bypassing all transports and local receivers
        $channel->enqueueOutgoing($message);
        return $channel->flush(true);
    }

    protected function getPointerData($key) {
        return array("url" => $this->getUrl($key));
    }    

    abstract public function getUrl($key);
    abstract public function getData($key);
    abstract public function setData($key, $value);    
}
