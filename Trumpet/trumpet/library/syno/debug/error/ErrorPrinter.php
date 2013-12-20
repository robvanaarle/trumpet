<?php

namespace syno\debug\error;

class ErrorPrinter extends \ultimo\debug\error\ErrorPrinter {
  
  protected function printException(\Exception $e) {
    if (!headers_sent()) {
      echo "Content-type: text/html\r\n\r\n";
    }
    
    echo 'ErrorPrinter: <pre>';
    echo $e;
    echo '</pre>';
  }
  
}