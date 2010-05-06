
PHP Library for Wildfire
========================

Use this library to send wildfire messages from PHP.

Usage
-----

Sending HTTP header messages:

    $channel = new Wildfire_MessageTest__Wildfire_Channel_HttpHeader();
    
    $dispatcher = new Wildfire_Dispatcher();
    $dispatcher->setChannel($channel);
    
    $message = new Wildfire_Message();
    $message->setData('Hello World');
    $message->setMeta('{"line":10}');
    $message->setProtocol('http://pinf.org/cadorn.org/wildfire/meta/Protocol/Component/0.1');
    $message->setSender('http://pinf.org/cadorn.org/wildfire/packages/lib-php');
    $message->setReceiver('http://pinf.org/cadorn.org/fireconsole');        
    
    $dispatcher->dispatch($message);
    
    $channel->flush();



Testing
-------

    phpunit tests



License
=======

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Copyright (c) 2009 Christoph Dorn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
