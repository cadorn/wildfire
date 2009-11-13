<?php

class Wildfire_Message
{
    
    private $data = null;
    
    
    public function setData($data)
    {
        if(!is_string($data)) {
            throw new Exception('$data is not a string');
        }
        $this->data = $data;
    }   
    
    public function getData()
    {
        return $this->data;
    }
    
}
