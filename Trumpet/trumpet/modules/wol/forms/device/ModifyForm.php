<?php

namespace modules\wol\forms\device;

class ModifyForm extends \ultimo\form\Form {
  
  protected function init() {
    $this['port'] = 7;
    
    $this->appendValidator('label', 'StringLength', array(1, 255));
    
    $this->appendValidator('mac', 'Regex', array('/^[a-z0-9]{2}:[a-z0-9]{2}:[a-z0-9]{2}:[a-z0-9]{2}:[a-z0-9]{2}:[a-z0-9]{2}$/i', 'mac.invalid'));
    $this->appendValidator('ip', 'Regex', array('/^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$/', 'ip.invalid'));
    $this->appendValidator('port', 'NumericValue', array(1, 65535));
    
    
  }
}