<?php

require_once 'Wildfire/Channel.php';

class Wildfire_Channel_HttpHeader extends Wildfire_Channel
{
    const CHUMK_DELIM = '__<|CHUNK|>__';

    private $messageIndex = 0;
    
    public function flush()
    {
        $messages = $this->getOutgoing();
        if(!$messages) {
            return 0;
        }
        $this->setHeader('x-wf-protocol-1: http://meta.wildfirehq.org/Protocol/Component/0.1');
        $this->setHeader('x-wf-1-1-sender: http://pinf.org/cadorn.org/wildfire/packages/lib-php');
        $this->setHeader('x-wf-1-1-1-receiver: http://pinf.org/cadorn.org/fireconsole');
        
        // try and read the last index from the outgoing headers
        $headers = headers_list();
        if($headers) {
            foreach( $headers as $header ) {
                if(substr(strtolower($header),0,13)=='x-wf-1-index:') {
                    $this->messageIndex = trim(substr(strtolower($header), 13));
                }
            }
        }
        
        // encode messages and write to headers        
        foreach( $messages as $message ) {
            $headers = $this->encode($message);
            foreach( $headers as $header ) {
                $this->setHeader('x-wf-1-index: ' . $header[0]);
                $this->setHeader($header[1]);
            }
        }
        return sizeof($messages);
    }
        
    private function getMessageIndex($increment=0)
    {
        $this->messageIndex += $increment;
        return $this->messageIndex;
    }
    
    private function encode(Wildfire_Message $message)
    {
        $protocol_index = 1;
        $sender_index = 1;
        $receiver_index = 1;
        
        $headers = array();
        
        $meta = $message->getMeta();
        if(!$meta) {
            $meta = '';
        }

        $data = str_replace('|', '\\|', $meta) . '|' . str_replace('|', '\\|', $message->getData());

        $parts = explode(self::CHUMK_DELIM, chunk_split($data, $this->messagePartMaxLength, self::CHUMK_DELIM));

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

                $headers[] = array($message_index, 'x-wf-' . $protocol_index . 
                             '-' . $sender_index . 
                             '-' . $receiver_index .
                             '-' . $message_index .
                             ': ' . $msg);
            }
        }

        return $headers;
    }

    protected function setHeader($value)
    {
        header($value);
    }
}
