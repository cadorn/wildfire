<?php

require_once 'Wildfire/Channel.php';

class Wildfire_Channel_HttpHeader extends Wildfire_Channel
{
    const CHUMK_DELIM = '__<|CHUNK|>__';

    private $messageIndex = 0;
    private $headerMaxLength = 5000;
    
    public function flush()
    {
        $messages = $this->getOutgoing();
        if(!$messages) {
            return 0;
        }
        $this->setHeader('x-wf-protocol-1: http://meta.wildfirehq.org/Protocol/Component/0.1');
        foreach( $messages as $message ) {
            $headers = $this->encode($message);
            foreach( $headers as $header ) {
                $this->setHeader($header);
            }
        }
        return sizeof($messages);
    }
    
    public function setHeaderMaxLength($length)
    {
        $this->headerMaxLength = $length;
    }
    
    private function getMessageIndex($increment=0)
    {
        // TODO: read outgoing headers to see if there ar already messages
        $this->messageIndex += $increment;
        return $this->messageIndex;
    }
    
    private function encode(Wildfire_Message $message)
    {
        $protocol_index = 1;
        $sender_index = 0;
        $receiver_index = 0;
        
        $headers = array();
        
        $data = json_encode($message->getData());

        $parts = explode(CHUMK_DELIM, chunk_split($data, $this->headerMaxLength, CHUMK_DELIM));

        for ($i=0 ; $i<count($parts) ; $i++) {

            $part = $parts[$i];
            if ($part) {

                $message_index = $this->getMessageIndex(1);

                if ($message_index > 99999) {
                    throw new Exception('Maximum number (99,999) of messages reached!');
                }

                $msg = '';

                if (count($parts)>2) {
                    $msg = (($i==0)?strlen($data):'')
                           . '|' . $part . '|'
                           . (($i<count($parts)-2)?'\\':'');
                } else {
                    $msg = strlen($part) . '|' . $part . '|';
                }

                $headers[] = 'x-wf-' . $protocol_index . 
                             '-' . $sender_index . 
                             '-' . $receiver_index .
                             '-' . $message_index .
                             ': ' . $msg;
            }
        }

        return $headers;
    }

    protected function setHeader($value)
    {
        header($value);
    }
}
