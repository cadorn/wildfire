<?php

require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';
require_once 'PHPUnit/Framework.php';

require_once 'Wildfire/Message.php';
require_once 'Wildfire/Dispatcher.php';
require_once 'Wildfire/Channel/HttpHeader.php';
 
class Wildfire_MessageTest extends PHPUnit_Framework_TestCase
{

    public function testSmall()
    {
        $channel = new Wildfire_MessageTest__Wildfire_Channel_HttpHeader();

        $dispatcher = new Wildfire_Dispatcher();
        $dispatcher->setChannel($channel);
        
        $message = new Wildfire_Message();
        $message->setData('Hello World');
        $message->setMeta('{"line":10}');
        $dispatcher->dispatch($message);
        $dispatcher->dispatch($message);
        
        $channel->flush();

        $this->assertEquals($channel->getHeaders(),
            array(
                'x-wf-protocol-1: http://meta.wildfirehq.org/Protocol/Component/0.1',
                'x-wf-1-0-0-1: 27|[{"line":10},"Hello World"]|',
                'x-wf-1-0-0-2: 27|[{"line":10},"Hello World"]|'
            )
        );
    }

    public function testLarge()
    {
        $channel = new Wildfire_MessageTest__Wildfire_Channel_HttpHeader();
        $channel->setMessagePartMaxLength(10);

        $dispatcher = new Wildfire_Dispatcher();
        $dispatcher->setChannel($channel);
        
        $message = new Wildfire_Message();

        $data = array();
        for( $i=0 ; $i<3 ; $i++ ) {
            $data[] = 'line ' . $i;
        }
        $message->setData(implode($data, "\n"));
        
        $dispatcher->dispatch($message);
        $dispatcher->dispatch($message);

        $channel->flush();

        $this->assertEquals($channel->getHeaders(),
            array(
                'x-wf-protocol-1: http://meta.wildfirehq.org/Protocol/Component/0.1',
                'x-wf-1-0-0-1: 29|[{},"line |\\',
                'x-wf-1-0-0-2: |0\nline 1\|\\',
                'x-wf-1-0-0-3: |nline 2"]|',
                'x-wf-1-0-0-4: 29|[{},"line |\\',
                'x-wf-1-0-0-5: |0\nline 1\|\\',
                'x-wf-1-0-0-6: |nline 2"]|'
            )
        );
    }
}


class Wildfire_MessageTest__Wildfire_Channel_HttpHeader extends Wildfire_Channel_HttpHeader
{
    var $headers = array();

    public function getHeaders()
    {
        return $this->headers;
    }
    
    protected function setHeader($value)
    {
        $this->headers[] = $value;
    }
}
