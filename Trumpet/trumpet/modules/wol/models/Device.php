<?php

namespace modules\wol\models;

class Device extends \ultimo\orm\Model {
  
  public $id;
  public $label;
  public $mac;
  public $ip;
  public $port;
  
  static protected $fields = array('id', 'label', 'mac', 'ip', 'port');
  static protected $primaryKey = array('id');
  static protected $autoIncrementField = 'id';
  
  public function wake() {
    $wol = $wol = new \ultimo\util\net\wol\WakeOnLan();
    $wol->wake($this->mac, $this->ip, $this->port);
  }

}