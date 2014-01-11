<?php

namespace modules\general\views\ext34\helpers;

class Synoman extends \ultimo\phptpl\mvc\Helper {
  public function __invoke() {
    return $this;
  }

  protected function constructUrl($url) {
    if ($this->application->getEnvironment() == 'development') {
      return 'synoman/' . ltrim($url, '/');
    } else {
      return $url;
    }
  }
  
  public function appendStylesheet($href) {
    $this->engine->headLink()->appendStylesheet($this->constructUrl($href));
  }
  
  public function prependStylesheet($href) {
    $this->engine->headLink()->prependStylesheet($this->constructUrl($href));
  }
  
  public function appendJavascriptFile($src) {
    $this->engine->headScript()->appendJavascriptFile($this->constructUrl($src));
  }
  
  public function prependJavascriptFile($src) {
    $this->engine->headScript()->prependJavascriptFile($this->constructUrl($src));
  }
}