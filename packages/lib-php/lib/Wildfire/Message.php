<?php

class Wildfire_Message
{
    private $data = null;
    private $meta = null;
    
    
    public function setData($data)
    {
        if(!is_string($data)) {
            throw new Exception('$data is not a string');
        }
        $this->data = $data;
        return true;
    }   
    
    public function getData()
    {
        return $this->data;
    }
    
    public function setMeta($meta)
    {
        if(!is_string($meta)) {
            throw new Exception('$meta is not a string');
        }
        if(json_decode($meta)===null) {
            throw new Exception('$meta is not a JSON string');
        }
        $this->meta = $meta;
    }   

    public function getMeta()
    {
        return $this->meta;
    }
    
}
