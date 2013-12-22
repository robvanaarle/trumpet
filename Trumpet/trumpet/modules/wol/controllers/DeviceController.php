<?php

namespace modules\wol\controllers;

class DeviceController extends \ultimo\mvc\Controller {
  
  protected $manager;
  
  protected function init() {
    $this->manager = $this->module->getPlugin('uorm')->getManager();
  }
  
  public function actionIndex() {
    $this->view->devices = $this->manager->Device->orderById()->all();
  }
  
  public function actionCreate() {
    $form = $this->module->getPlugin('formBroker')->createForm(
      'device\CreateForm', $this->request->getParam('form', array())
    );
    
    if ($this->request->isPost()){
      if ($form->validate()) {
        $device = $this->manager->Device->create();
        $device->label = $form['label'];
        $device->mac = $form['mac'];
        $device->ip = $form['ip'];
        $device->port = $form['port'];
        $device->save();
        
        return $this->getPlugin('redirector')->redirect(array('action' => 'index'));
      }
    }
    
    $this->view->form = $form;
  }
  
  public function actionUpdate() {
    $id = $this->request->getParam('id');
    
    $device = $this->manager->Device->getById($id);
    
    if ($device === null) {
      throw new \ultimo\mvc\exceptions\DispatchException("Device with id '{$id}' does not exist.", 404);
    }

    $form = $this->module->getPlugin('formBroker')->createForm(
      'device\UpdateForm', $this->request->getParam('form', array())
    );

    if ($this->request->isPost()) {
      if ($form->validate()) {
        $device->label = $form['label'];
        $device->mac = $form['mac'];
        $device->ip = $form['ip'];
        $device->port = $form['port'];
        $device->save();
      
        return $this->getPlugin('redirector')->redirect(array('action' => 'index'));
      }
    } else {
      $form->fromArray($device->toArray());
    }
    
    $this->view->id = $id;
    $this->view->form = $form;
  }
  
  public function actionDelete() {
    $id = $this->request->getParam('id');
    $device = $this->manager->Device->getById($id);
    if ($device === null) {
      throw new \ultimo\mvc\exceptions\DispatchException("Device with id '{$id}' does not exist.", 404);
    }
    $device->delete();
    return $this->getPlugin('redirector')->redirect(array('action' => 'index'));
  }
  
  public function actionWake() {
    $id = $this->request->getParam('id');
    $device = $this->manager->Device->getById($id);
    if ($device === null) {
      throw new \ultimo\mvc\exceptions\DispatchException("Device with id '{$id}' does not exist.", 404);
    }
    
    $this->view->device = $device;
    
    $exception = null;
    try {
      $device->wake();
    } catch (\Exception $e) {
      $exception = $e;
    }
    
    $this->view->exception = $exception;
  }
}