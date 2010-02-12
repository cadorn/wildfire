<?php

abstract class Wildfire_Protocol
{
    private static $protocols = array();
    protected $uri = null;

    public static function factory($uri) {
        if(isset(self::$protocols[$uri])) {
            return self::$protocols[$uri];
        }
        $class = null;
        switch($uri) {
            case 'http://registry.pinf.org/cadorn.org/github/wildfire/@meta/protocol/component/0.1.0':
            case '__TEST__':
            	$class = 'Wildfire_Protocol_Component';
                break;
            default:
                throw new Exception('Unknown protocol: ' . $uri);
                break;
        }
        require_once(str_replace('_', '/', $class) . '.php');
        return (self::$protocols[$uri] = new $class($uri));
    }

    public function __construct($uri) {
        $this->uri = $uri;
    }
    
    abstract public function encodeMessage($options, $message);
    abstract public function encodeKey($util, $receiverId, $senderId);
    
}
