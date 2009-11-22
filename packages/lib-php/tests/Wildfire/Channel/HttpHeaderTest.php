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


        $this->assertEquals(
            array(
                'x-wf-protocol-1' => 'http://meta.wildfirehq.org/Protocol/Component/0.1',
                'x-wf-1-1-sender' => 'http://pinf.org/cadorn.org/wildfire/packages/lib-php',
                'x-wf-1-1-1-receiver' => 'http://pinf.org/cadorn.org/fireconsole',
                'x-wf-1-index' => '2',
                'x-wf-1-1-1-1' => '23|{"line":10}|Hello World|',
                'x-wf-1-1-1-2' => '23|{"line":10}|Hello World|'
            ),
            $channel->getHeaders()
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
        $message->setData(implode($data, "; "));
        
        $dispatcher->dispatch($message);
        $dispatcher->dispatch($message);

        $channel->flush();

        $this->assertEquals(
            array(
                'x-wf-protocol-1' => 'http://meta.wildfirehq.org/Protocol/Component/0.1',
                'x-wf-1-1-sender' => 'http://pinf.org/cadorn.org/wildfire/packages/lib-php',
                'x-wf-1-1-1-receiver' => 'http://pinf.org/cadorn.org/fireconsole',
                'x-wf-1-index' => '6',
                'x-wf-1-1-1-1' => '23||line 0; l|\\',
                'x-wf-1-1-1-2' => '|ine 1; lin|\\',
                'x-wf-1-1-1-3' => '|e 2|',
                'x-wf-1-1-1-4' => '23||line 0; l|\\',
                'x-wf-1-1-1-5' => '|ine 1; lin|\\',
                'x-wf-1-1-1-6' => '|e 2|'
            ),
            $channel->getHeaders()
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
    
    protected function setHeader($name, $value)
    {
        $this->headers[$name] = '' . $value;
    }
}
