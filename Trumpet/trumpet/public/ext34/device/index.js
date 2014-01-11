Ext.onReady(function(){

  // NOTE: This is an example showing simple state management. During development,
  // it is generally best to disable state management as dynamically-generated ids
  // can change across page loads, leading to unpredictable results.  The developer
  // should ensure that stable state ids are set for stateful components in real apps.   
  Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

  var store = new Ext.data.ArrayStore({
    fields: [
      {name: 'id'},
      {name: 'label', type: 'string'},
      {name: 'mac', type: 'string'},
      {name: 'ip', type: 'string'},
      {name: 'port', type: 'string'}
    ],
    data: deviceData
  });

  // create the Grid
  var grid = new Ext.grid.GridPanel({
    id: 'tasks',
    store: store,
    columns: [
      {id:'label',header: 'Label', width: 100, sortable: true, dataIndex: 'label'},
      {header: 'Mac', width: 150, sortable: true, dataIndex: 'mac'},
      {header: 'IP', width: 150, sortable: true, dataIndex: 'ip'},
      {header: 'Port', width: 100, sortable: true, dataIndex: 'port'}
    ],
    enableHdMenu: false,
    stripeRows: true,
    autoExpandColumn: 'label',
    flex: 1,

    //title: 'Array Grid',

    // config options for stateful behavior
    //stateful: true,
    //stateId: 'grid'

    sm: new Ext.grid.RowSelectionModel({singleSelect:true})
  });

  grid.on('rowclick', function(grid, rowIndex, columnIndex, e) {
    Ext.select('.task-button').each(function(el) {
      var button = Ext.getCmp(el.id).enable();
    });
  }, this);


  var viewport = new Ext.Viewport({
    renderTo: Ext.getBody(),

    layout:'vbox',
    layoutConfig: {
        align : 'stretch',
        pack  : 'start'
    },
    items: [{
      layout: 'table',
      xtype:'panel',
      defaultType: 'button',
      items: [
        {text: 'Create', handler: function() {
          //console.log(Ext.getCmp('tasks').getSelectionModel().getSelected().data);

          var windowCreateDevice;
          if(!windowCreateDevice){

            Ext.QuickTips.init();

            Ext.apply(Ext.form.VTypes, {
              IPAddress: function(v) {
                return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v);
              },
              IPAddressText: 'Must be a numeric IP address',
              IPAddressMask: /[\d\.]/i,
              
              Port: function(v) {
                return /^\d+$/.test(v) && v >=1 && v<=65335;
              },
              PortText: 'Must be between 1 and 65335',
              PortMask: /[\d]/i
            });
            
            var formCreateDevice = new Ext.FormPanel({
              labelWidth: 75,
              url:' save-form.php',
              frame: true,
              //title: 'Simple Form',
              bodyStyle: 'padding:5px 5px 0',
              width: 350,
              defaults: {width: 230},
              defaultType: 'textfield',

              items: [{
                  fieldLabel: 'Label',
                  name: 'label',
                  allowBlank: false
                },{
                  fieldLabel: 'Mac',
                  name: 'mac',
                  allowBlank: false
                },{
                  fieldLabel: 'IP',
                  name: 'ip',
                  vtype: 'IPAddress',
                  allowBlank: false
                }, {
                  fieldLabel: 'Port',
                  name: 'port',
                  vtype: 'Port',
                  allowBlank: false
                }
              ]
            });
            
            windowCreateDevice = new Ext.Window({
              title: 'Create Device',
              layout: 'fit',
              width: 400,
              height: 250,
              closeAction: 'hide',
              plain: true,
              modal: true,
              resizable: false,

              items: formCreateDevice,

              buttons: [{
                text:'Create',
                handler: function() { formCreateDevice.getForm().submit(); }
              },{
                text: 'Cancel',
                handler: function() { windowCreateDevice.hide(); }
              }]
            });
          }

          windowCreateDevice.show();

        }},
        {text: 'Edit', disabled: true, cls: 'task-button'},
        {text: 'Delete', disabled: true, cls: 'task-button', handler: function() {
          Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete the selected device?', function(btn) {
            console.log(btn);
          });
        }}
      ]},
      
      grid
    ]

  });

});