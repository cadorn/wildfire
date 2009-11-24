<?php

require_once 'Wildfire/Channel.php';

class Wildfire_Channel_HttpHeader extends Wildfire_Channel
{
    const CHUMK_DELIM = '__<|CHUNK|>__';

    private $messageIndex = 0;
    
    private $protocols = array();
    private $senders = array();
    private $receivers = array();
    
    public function flush()
    {
        $messages = $this->getOutgoing();
        if(!$messages) {
            return 0;
        }
        
        // TODO: Refactor protocol related code into separate protocol class to allow for other protocols
        
        // try and read existing sender, receiver and index headers
        $headers = headers_list();
        if($headers) {
            foreach( $headers as $header ) {
                if(substr(strtolower($header),0,13)=='x-wf-1-index:') {
                    $this->messageIndex = trim(substr(strtolower($header), 13));
                } else
                if(preg_match_all('/^x-wf-1-([^-]*)-sender:.*$/si', $header, $m)) {
                    // TODO
                } else
                if(preg_match_all('/^x-wf-1-([^-]*)-([^-]*)-receiver:.*$/si', $header, $m)) {
                    // TODO
                }
            }
        }
        
        $protocol_id = $this->getProtocolId('http://meta.wildfirehq.org/Protocol/Component/0.1');
        
        // encode messages and write to headers        
        foreach( $messages as $message ) {
            $headers = $this->encode($protocol_id, $message);
            foreach( $headers as $header ) {
                $this->setHeader('x-wf-1-index', $header[0]);
                $this->setHeader($header[1], $header[2]);
            }
        }
        return sizeof($messages);
    }
        
    private function getMessageIndex($increment=0)
    {
        $this->messageIndex += $increment;
        return $this->messageIndex;
    }
    
    private function getProtocolId($uri)
    {
        if(!isset($this->protocols[$uri])) {
            $this->protocols[$uri] = sizeof($this->protocols)+1;
            $this->setHeader('x-wf-' . $this->protocols[$uri] . '-protocol', $uri);
        }
        return $this->protocols[$uri];
    }
    
    private function getSenderId($protocol_id, $uri)
    {
        if(!$uri) {
            $uri = 'http://pinf.org/cadorn.org/wildfire/packages/lib-php';
        }
        if(!isset($this->senders[$protocol_id])) {
            $this->senders[$protocol_id] = array();
        }
        if(!isset($this->senders[$protocol_id][$uri])) {
            $this->senders[$protocol_id][$uri] = sizeof($this->senders[$protocol_id])+1;
            $this->setHeader('x-wf-' . $protocol_id . '-' . $this->senders[$protocol_id][$uri] . '-sender', $uri);
        }
        return $this->senders[$protocol_id][$uri];
    }
    
    private function getReceiverId($protocol_id, $sender_id, $uri)
    {
        if(!$uri) {
            throw new Exception("No receiver set for message");
        }
        if(!isset($this->senders[$protocol_id])) {
            $this->receivers[$protocol_id] = array();
        }
        if(!isset($this->receivers[$protocol_id][$sender_id])) {
            $this->receivers[$protocol_id][$sender_id] = array();
        }
        if(!isset($this->receivers[$protocol_id][$sender_id][$uri])) {
            $this->receivers[$protocol_id][$sender_id][$uri] = sizeof($this->receivers[$protocol_id][$sender_id])+1;
            $this->setHeader('x-wf-' . $protocol_id . '-' . $sender_id . '-' . $this->receivers[$protocol_id][$sender_id][$uri] . '-receiver', $uri);
        }
        return $this->receivers[$protocol_id][$sender_id][$uri];
    }
    
    private function encode($protocol_id, Wildfire_Message $message)
    {
        $sender_id = $this->getSenderId($protocol_id, $message->getSender());
        $receiver_id = $this->getReceiverId($protocol_id, $sender_id, $message->getReceiver());
        
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

                $headers[] = array(
                    $message_index,
                    'x-wf-' . $protocol_id . 
                        '-' . $sender_id . 
                        '-' . $receiver_id .
                        '-' . $message_index,
                    $msg);
            }
        }

        return $headers;
    }

    protected function setHeader($name, $value)
    {
        // replace headers with same name
        header($name . ': ' . $value, true);
    }
}
