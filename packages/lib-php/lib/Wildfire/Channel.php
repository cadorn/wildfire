<?php

require_once 'Wildfire/Protocol.php';


abstract class Wildfire_Channel
{    

    private $receivers = array();
    protected $options = array();
    private $outgoingQueue = array();
    
    public function __construct()
    {
        $this->options['messagePartMaxLength'] = 5000;
    }

    public function enqueueOutgoing(Wildfire_Message $message)
    {
        $this->outgoingQueue[] = $this->encode($message);
        return true;
    }
    
    public function getOutgoing()
    {
        return $this->outgoingQueue;
    }


    public function setMessagePartMaxLength($length)
    {
        $this->options['messagePartMaxLength'] = $length;
    }

    public function flush()
    {
        $messages = $this->getOutgoing();
        if(!$messages) {
            return 0;
        }
        
        $util = array(
            "applicator" => $this,
            "HEADER_PREFIX" => "x-wf-"
        );
                
        // encode messages and write to headers        
        foreach( $messages as $message ) {
            $headers = $message;
            foreach( $headers as $header ) {
                $this->setMessagePart(
                    Wildfire_Protocol::factory($header[0])->encodeKey($util, $header[1], $header[2]),
                    $header[3]
                );
            }
        }
        return sizeof($messages);
    }

    private function encode(Wildfire_Message $message)
    {
        $protocol_id = $message->getProtocol();
        if(!$protocol_id) {
            throw new Exception("Protocol not set for message");
        }
        return Wildfire_Protocol::factory($protocol_id)->encodeMessage($this->options, $message);
    }


    abstract public function setMessagePart($key, $value);
    
    abstract public function getMessagePart($key);
    
}
