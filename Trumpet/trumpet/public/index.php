<?php
require '../vendor/autoload.php';

// error settings
error_reporting(-1);
ini_set('display_errors', 0); // ErrorPrinter is used

// determine environment. On synology this is 'production', else 'development'.
if (strpos(getcwd(), '@appstore') !== false) {
  $environment = 'production';
} else {
  $environment = 'development';
}

date_default_timezone_set('America/New_York');

// create and register the error handler as early as possible
$errorHandler = new \syno\debug\error\ErrorPrinter(array(
  'print_errors' => true
));
$errorHandler->register();

// create the application and run it
$app = new \ultimo\mvc\Application('trumpet', '../');
$app->setRegistry('ultimo.debug.error.ErrorHandler', $errorHandler)
    ->setEnvironment($environment)
    ->runBootstrap()
    ->run();

// unregister error handler
$errorHandler->unregister();