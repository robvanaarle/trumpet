<?php

//echo "Content-type: text/html\r\n\r\n";

// error settings
error_reporting(E_ALL);
ini_set('display_errors', '0'); // ErrorPrinter is used

// determine environment. On synology this is 'production', else 'development'.
if (strpos(getcwd(), '@appstore') !== false) {
  $environment = 'production';
} else {
  $environment = 'development';

  //TODO: make this nicer
  set_include_path('/Users/raarle/Development/PHP Projects/' . PATH_SEPARATOR . get_include_path());
  set_include_path('/Users/Rob/NetBeansProjects' . PATH_SEPARATOR . get_include_path());
}

date_default_timezone_set('America/New_York');

// add library to include path
set_include_path(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'library' . PATH_SEPARATOR . get_include_path());

// create and register the error handler as early as possible
require_once('ultimo/debug/error/ErrorPrinter.php');
require_once('syno/debug/error/ErrorPrinter.php');
$errorHandler = new \syno\debug\error\ErrorPrinter(array(
  'print_errors' => true
));
$errorHandler->register();

// register autoloader
require_once('ultimo/io/Autoloader.php');
$autoLoader = new \ultimo\io\Autoloader();
$autoLoader->register();

// create the application and run it
$app = new \ultimo\mvc\Application('trumpet', '../');
$app->setRegistry('ultimo.debug.error.ErrorHandler', $errorHandler)
    ->setEnvironment($environment)
    ->runBootstrap()
    ->run();

// unregister error handler
$errorHandler->unregister();