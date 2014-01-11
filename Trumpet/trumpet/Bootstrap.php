<?php

class Bootstrap extends \ultimo\mvc\Bootstrap implements \ultimo\mvc\plugins\ApplicationPlugin {
  public function run() {    
    // router
    $this->initRoutes();
    
    $this->application->addModulesDir($this->application->getApplicationDir() . '/library/modules');
    
    $this->application->getPlugin('viewRenderer')->setTheme('ext34');
    
    // ErrorHandler
    $errorHandler = new \ultimo\mvc\plugins\ErrorHandler();
    $errorHandler->setDebugErrorHandler($this->application->getRegistry('ultimo.debug.error.ErrorHandler'));
    $this->application->addPlugin($errorHandler);
     
    // add sqlite connection
    $uormPlugin = new \ultimo\orm\mvc\plugins\OrmManagers();
    $uormPlugin->addConnection('master', 'sqlite://' . __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . $this->application->getEnvironment() . DIRECTORY_SEPARATOR . 'db.sqlite');
    $this->application->addPlugin($uormPlugin, 'uorm');
    
    // FileTranslator
    $translator = new \ultimo\translate\mvc\plugins\FileTranslator($this->application, 'en');
    $translator->setAvailableLocales(array('en'));
    $this->application->addPlugin($translator);
    
    // Locale
    //$localesPlugin = new \ultimo\util\locale\mvc\plugins\Locale('en');
    //$localesPlugin->getFormatter()->dateTimeZone = new DateTimeZone('Europe/Amsterdam');
    //$this->application->addPlugin($localesPlugin, 'locale');
        
    // Config
    $this->application->addPlugin(new \ultimo\util\config\mvc\plugins\FileConfigPlugin('\ultimo\util\config\IniConfig', 'ini'));
  
    // FormBroker
    $this->application->addPlugin(new \ultimo\form\mvc\FormsPlugin('ext3'));
    
    // Register this Bootstrap as plugin
    $this->application->addPlugin($this);
  }
  
  public function initRoutes() {
    $router = $this->application->getRouter();
    
    $router->addRule('default', new \ultimo\mvc\routers\rules\BasicQueryStringRule('index.cgi', array(
        'module' => 'general',
        'controller' => 'index',
        'action' => 'index'
    )));
  }
  
  public function onPluginAdded(\ultimo\mvc\Application $application) { }
  
  public function onModuleCreated(\ultimo\mvc\Module $module) { }
  
  public function onRoute(\ultimo\mvc\Application $application, \ultimo\mvc\Request $request) {
    // only index.cgi will be called, so use that dirname as base path
    $request->setBasePath(dirname($request->getUri(false)));
  }
  
  public function onRouted(\ultimo\mvc\Application $application, \ultimo\mvc\Request $request=null) { }
  
  public function onDispatch(\ultimo\mvc\Application $application) {
    // use custom session save path and session handler under cli mode
    ini_set('session.save_path', __DIR__ . DIRECTORY_SEPARATOR . 'temp' . DIRECTORY_SEPARATOR . 'session');
    $sessionHandler = new \ultimo\util\session\mvc\SessionHandler(
      new \ultimo\util\session\FileSessionHandler(),
      $application->getRequest(),
      $application->getResponse()
    );
    $sessionHandler->register();
  }
  
  public function onDispatched(\ultimo\mvc\Application $application) { }
}