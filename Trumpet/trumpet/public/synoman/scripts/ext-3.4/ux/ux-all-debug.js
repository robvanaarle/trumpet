/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.grid');

/**
 * @class Ext.ux.grid.BufferView
 * @extends Ext.grid.GridView
 * A custom GridView which renders rows on an as-needed basis.
 */
Ext.ux.grid.BufferView = Ext.extend(Ext.grid.GridView, {
	/**
	 * @cfg {Number} rowHeight
	 * The height of a row in the grid.
	 */
	rowHeight: 19,

	/**
	 * @cfg {Number} borderHeight
	 * The combined height of border-top and border-bottom of a row.
	 */
	borderHeight: 2,

	/**
	 * @cfg {Boolean/Number} scrollDelay
	 * The number of milliseconds before rendering rows out of the visible
	 * viewing area. Defaults to 100. Rows will render immediately with a config
	 * of false.
	 */
	scrollDelay: 100,

	/**
	 * @cfg {Number} cacheSize
	 * The number of rows to look forward and backwards from the currently viewable
	 * area.  The cache applies only to rows that have been rendered already.
	 */
	cacheSize: 20,

	/**
	 * @cfg {Number} cleanDelay
	 * The number of milliseconds to buffer cleaning of extra rows not in the
	 * cache.
	 */
	cleanDelay: 500,

	initTemplates : function(){
		Ext.ux.grid.BufferView.superclass.initTemplates.call(this);
		var ts = this.templates;
		// empty div to act as a place holder for a row
	        ts.rowHolder = new Ext.Template(
		        '<div class="x-grid3-row {alt}" style="{tstyle}"></div>'
		);
		ts.rowHolder.disableFormats = true;
		ts.rowHolder.compile();

		ts.rowBody = new Ext.Template(
		        '<table class="x-grid3-row-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
			'<tbody><tr>{cells}</tr>',
			(this.enableRowBody ? '<tr class="x-grid3-row-body-tr" style="{bodyStyle}"><td colspan="{cols}" class="x-grid3-body-cell" tabIndex="0" hidefocus="on"><div class="x-grid3-row-body">{body}</div></td></tr>' : ''),
			'</tbody></table>'
		);
		ts.rowBody.disableFormats = true;
		ts.rowBody.compile();
	},

	getStyleRowHeight : function(){
		return Ext.isBorderBox ? (this.rowHeight + this.borderHeight) : this.rowHeight;
	},

	getCalculatedRowHeight : function(){
		return this.rowHeight + this.borderHeight;
	},

	getVisibleRowCount : function(){
		var rh = this.getCalculatedRowHeight(),
		    visibleHeight = this.scroller.dom.clientHeight;
		return (visibleHeight < 1) ? 0 : Math.ceil(visibleHeight / rh);
	},

	getVisibleRows: function(){
		var count = this.getVisibleRowCount(),
		    sc = this.scroller.dom.scrollTop,
		    start = (sc === 0 ? 0 : Math.floor(sc/this.getCalculatedRowHeight())-1);
		return {
			first: Math.max(start, 0),
			last: Math.min(start + count + 2, this.ds.getCount()-1)
		};
	},

	doRender : function(cs, rs, ds, startRow, colCount, stripe, onlyBody){
		var ts = this.templates, 
            ct = ts.cell, 
            rt = ts.row, 
            rb = ts.rowBody, 
            last = colCount-1,
		    rh = this.getStyleRowHeight(),
		    vr = this.getVisibleRows(),
		    tstyle = 'width:'+this.getTotalWidth()+';height:'+rh+'px;',
		    // buffers
		    buf = [], 
            cb, 
            c, 
            p = {}, 
            rp = {tstyle: tstyle}, 
            r;
		for (var j = 0, len = rs.length; j < len; j++) {
			r = rs[j]; cb = [];
			var rowIndex = (j+startRow),
			    visible = rowIndex >= vr.first && rowIndex <= vr.last;
			if (visible) {
				for (var i = 0; i < colCount; i++) {
					c = cs[i];
					p.id = c.id;
					p.css = i === 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
					p.attr = p.cellAttr = "";
					p.value = c.renderer(r.data[c.name], p, r, rowIndex, i, ds);
					p.style = c.style;
					if (p.value === undefined || p.value === "") {
						p.value = "&#160;";
					}
					if (r.dirty && typeof r.modified[c.name] !== 'undefined') {
						p.css += ' x-grid3-dirty-cell';
					}
					cb[cb.length] = ct.apply(p);
				}
			}
			var alt = [];
			if(stripe && ((rowIndex+1) % 2 === 0)){
			    alt[0] = "x-grid3-row-alt";
			}
			if(r.dirty){
			    alt[1] = " x-grid3-dirty-row";
			}
			rp.cols = colCount;
			if(this.getRowClass){
			    alt[2] = this.getRowClass(r, rowIndex, rp, ds);
			}
			rp.alt = alt.join(" ");
			rp.cells = cb.join("");
			buf[buf.length] =  !visible ? ts.rowHolder.apply(rp) : (onlyBody ? rb.apply(rp) : rt.apply(rp));
		}
		return buf.join("");
	},

	isRowRendered: function(index){
		var row = this.getRow(index);
		return row && row.childNodes.length > 0;
	},

	syncScroll: function(){
		Ext.ux.grid.BufferView.superclass.syncScroll.apply(this, arguments);
		this.update();
	},

	// a (optionally) buffered method to update contents of gridview
	update: function(){
		if (this.scrollDelay) {
			if (!this.renderTask) {
				this.renderTask = new Ext.util.DelayedTask(this.doUpdate, this);
			}
			this.renderTask.delay(this.scrollDelay);
		}else{
			this.doUpdate();
		}
	},
    
    onRemove : function(ds, record, index, isUpdate){
        Ext.ux.grid.BufferView.superclass.onRemove.apply(this, arguments);
        if(isUpdate !== true){
            this.update();
        }
    },

	doUpdate: function(){
		if (this.getVisibleRowCount() > 0) {
			var g = this.grid, 
                cm = g.colModel, 
                ds = g.store,
    	        cs = this.getColumnData(),
		        vr = this.getVisibleRows(),
                row;
			for (var i = vr.first; i <= vr.last; i++) {
				// if row is NOT rendered and is visible, render it
				if(!this.isRowRendered(i) && (row = this.getRow(i))){
					var html = this.doRender(cs, [ds.getAt(i)], ds, i, cm.getColumnCount(), g.stripeRows, true);
					row.innerHTML = html;
				}
			}
			this.clean();
		}
	},

	// a buffered method to clean rows
	clean : function(){
		if(!this.cleanTask){
			this.cleanTask = new Ext.util.DelayedTask(this.doClean, this);
		}
		this.cleanTask.delay(this.cleanDelay);
	},

	doClean: function(){
		if (this.getVisibleRowCount() > 0) {
			var vr = this.getVisibleRows();
			vr.first -= this.cacheSize;
			vr.last += this.cacheSize;

			var i = 0, rows = this.getRows();
			// if first is less than 0, all rows have been rendered
			// so lets clean the end...
			if(vr.first <= 0){
				i = vr.last + 1;
			}
			for(var len = this.ds.getCount(); i < len; i++){
				// if current row is outside of first and last and
				// has content, update the innerHTML to nothing
				if ((i < vr.first || i > vr.last) && rows[i].innerHTML) {
					rows[i].innerHTML = '';
				}
			}
		}
	},
    
    removeTask: function(name){
        var task = this[name];
        if(task && task.cancel){
            task.cancel();
            this[name] = null;
        }
    },
    
    destroy : function(){
        this.removeTask('cleanTask');
        this.removeTask('renderTask');  
        Ext.ux.grid.BufferView.superclass.destroy.call(this);
    },

	layout: function(){
		Ext.ux.grid.BufferView.superclass.layout.call(this);
		this.update();
	}
});

Ext.override(Ext.ux.grid.BufferView, {
	constructor: function(config) {
		Ext.ux.grid.BufferView.superclass.constructor.call(this, config);
		this.addEvents(
			'bufferupdated'
		);
	},
	doUpdate: function(){
		if (this.getVisibleRowCount() > 0) {
			var g = this.grid,
				cm = g.colModel,
				ds = g.store,
				cs = this.getColumnData(),
				vr = this.getVisibleRows(),
				row;
			for (var i = vr.first; i <= vr.last; i++) {
				// if row is NOT rendered and is visible, render it
				if(!this.isRowRendered(i) && (row = this.getRow(i))){
					var html = this.doRender(cs, [ds.getAt(i)], ds, i, cm.getColumnCount(), g.stripeRows, true);
					row.innerHTML = html;
				}
			}
			this.clean();
		}
		this.fireEvent('bufferupdated', this);
	},
	doClean: function(){
		if (this.getVisibleRowCount() > 0) {
			var vr = this.getVisibleRows();
			vr.first -= this.cacheSize;
			vr.last += this.cacheSize;

			var i = 0, rows = this.getRows();
			// if first is less than 0, all rows have been rendered
			// so lets clean the end...
			if(vr.first <= 0){
				i = vr.last + 1;
			}
			for(var len = this.ds.getCount(); i < len; i++){
				// if current row is outside of first and last and
				// has content, update the innerHTML to nothing
				if ((i < vr.first || i > vr.last) && rows[i]) {
					rows[i].innerHTML = '';
				}
			}
		}
	}
});/**
 * @class Ext.ux.grid.CellActions
 * @extends Ext.util.Observable
 *
 * CellActions plugin for Ext grid
 *
 * CellActions plugin causes that column model recognizes the config property cellAcions
 * that is the array of configuration objects for that column. The documentationi follows.
 *
 * THE FOLLOWING CONFIG OPTIONS ARE FOR COLUMN MODEL COLUMN, NOT FOR CellActions ITSELF.
 *
 * @cfg {Array} cellActions Mandatory. Array of action configuration objects. The following
 * configuration options of action are recognized:
 *
 * - @cfg {Function} callback Optional. Function to call if the action icon is clicked.
 *   This function is called with same signature as action event and in its original scope.
 *   If you need to call it in different scope or with another signature use 
 *   createCallback or createDelegate functions. Works for statically defined actions. Use
 *   callbacks configuration options for store bound actions.
 *
 * - @cfg {Function} cb Shortcut for callback.
 *
 * - @cfg {String} iconIndex Optional, however either iconIndex or iconCls must be
 *   configured. Field name of the field of the grid store record that contains
 *   css class of the icon to show. If configured, shown icons can vary depending
 *   of the value of this field.
 *
 * - @cfg {String} iconCls. css class of the icon to show. It is ignored if iconIndex is
 *   configured. Use this if you want static icons that are not base on the values in the record.
 *
 * - @cfg {String} qtipIndex Optional. Field name of the field of the grid store record that 
 *   contains tooltip text. If configured, the tooltip texts are taken from the store.
 *
 * - @cfg {String} tooltip Optional. Tooltip text to use as icon tooltip. It is ignored if 
 *   qtipIndex is configured. Use this if you want static tooltips that are not taken from the store.
 *
 * - @cfg {String} qtip Synonym for tooltip
 *
 * - @cfg {String} style Optional. Style to apply to action icon container.
 *
 * The following css is required:
 *
 * .ux-cell-value {
 * 	position:relative;
 * 	zoom:1;
 * }
 * .ux-cell-actions {
 * 	position:absolute;
 * 	right:0;
 * 	top:-2px;
 * }
 * .ux-cell-actions-left {
 * 	left:0;
 * 	top:-2px;
 * }
 * .ux-cell-action {
 * 	width:16px;
 * 	height:16px;
 * 	float:left;
 * 	cursor:pointer;
 * 	margin: 0 0 0 4px;
 * }
 * .ux-cell-actions-left .ux-cell-action {
 * 	margin: 0 4px 0 0;
 * }
 * @author    Ing. Jozef Sakáloš
 * @date      22. March 2008
 * @version   1.0
 * @revision  $Id: CellActions.js,v 1.1 2010-06-28 12:40:02 stevenc Exp $
 *
 * @license Ext.ux.grid.CellActions is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 * 
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 * @forum     30411
 * @demo      http://cellactions.extjs.eu
 * @download  
 * <ul>
 * <li><a href="http://cellactions.extjs.eu/cellactions.tar.bz2">cellactions.tar.bz2</a></li>
 * <li><a href="http://cellactions.extjs.eu/cellactions.tar.gz">cellactions.tar.gz</a></li>
 * <li><a href="http://cellactions.extjs.eu/cellactions.zip">cellactions.zip</a></li>
 * </ul>
 *
 * @donate
 * <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
 * <input type="hidden" name="cmd" value="_s-xclick">
 * <input type="hidden" name="hosted_button_id" value="3430419">
 * <input type="image" src="https://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" 
 * border="0" name="submit" alt="PayPal - The safer, easier way to pay online.">
 * <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1">
 * </form>
 */

Ext.ns('Ext.ux.grid');

// constructor and cellActions documentation
// {{{
/**
 * Creates new CellActions
 * @constructor
 * @param {Object} config A config object
 */
Ext.ux.grid.CellActions = function(config) {
	Ext.apply(this, config);
	
	this.addEvents(	/**
	 * @event action
	 * Fires when user clicks a cell action
	 * @param {Ext.grid.GridPanel} grid
	 * @param {Ext.data.Record} record Record containing data of clicked cell
	 * @param {String} action Action clicked (equals iconCls);
	 * @param {Mixed} value Value of the clicke cell
	 * @param {String} dataIndex as specified in column model
	 * @param {Number} rowIndex Index of row clicked
	 * @param {Number} colIndex Incex of col clicked
	 */
	'action'	/**
	 * @event beforeaction
	 * Fires when user clicks a cell action but before action event is fired. Return false to cancel the action;
	 * @param {Ext.grid.GridPanel} grid
	 * @param {Ext.data.Record} record Record containing data of clicked cell
	 * @param {String} action Action clicked (equals iconCls);
	 * @param {Mixed} value Value of the clicke cell
	 * @param {String} dataIndex as specified in column model
	 * @param {Number} rowIndex Index of row clicked
	 * @param {Number} colIndex Incex of col clicked
	 */
	, 'beforeaction');
	// call parent
	Ext.ux.grid.CellActions.superclass.constructor.call(this);
	
}; // eo constructor
// }}}

Ext.extend(Ext.ux.grid.CellActions, Ext.util.Observable, {

	/**
	 * @cfg {String} actionEvent Event to trigger actions, e.g. click, dblclick, mouseover (defaults to 'click')
	 */
	actionEvent: 'click'	/**
	 * @cfg {Number} actionWidth Width of action icon in pixels. Has effect only if align:'left'
	 */
	,
	actionWidth: 20	/**
	 * @cfg {String} align Set to 'left' to put action icons before the cell text. (defaults to undefined, meaning right)
	 */
	/**
	 * @private
	 * @cfg {String} tpl Template for cell with actions
	 */
	,
	tpl: '<div class="ux-cell-value" style="padding-left:{padding}px">' +
	'<tpl if="\'left\'!==align">{value}</tpl>' +
	'<div class="ux-cell-actions<tpl if="\'left\'===align"> ux-cell-actions-left</tpl>" style="width:{width}px">' +
	'<tpl for="actions"><div class="ux-cell-action {cls}" qtip="{qtip}" style="{style}">&#160;</div></tpl>' +
	'</div>' +
	'<tpl if="\'left\'===align">{value}</tpl>' +
	'</div>'	/**
	 * Called at the end of processActions. Override this if you need it.
	 * @param {Object} c Column model configuration object
	 * @param {Object} data See this.processActions method for details
	 */
	,
	userProcessing: Ext.emptyFn	// {{{
	/**
	 * Init function
	 * @param {Ext.grid.GridPanel} grid Grid this plugin is in
	 */
	,
	init: function(grid) {
		this.grid = grid;
		grid.afterRender = grid.afterRender.createSequence(this.onRenderGrid, this);
		
		var cm = this.grid.getColumnModel();
		Ext.each(cm.config, function(c, idx) {
			if ('object' === typeof c.cellActions) {
				c.origRenderer = cm.getRenderer(idx);
				c.renderer = this.renderActions.createDelegate(this);
			}
		}, this);
		
		
	} // eo function init
	// }}}
	// {{{
	/**
	 * grid render event handler, install actionEvent handler on view.mainBody
	 * @private
	 */
	,
	onRenderGrid: function() {
	
		// install click event handler on view mainBody
		this.view = this.grid.getView();
		var cfg = {
			scope: this
		};
		cfg[this.actionEvent] = this.onClick;
		this.view.mainBody.on(cfg);
		
	} // eo function onRender
	// }}}
	// {{{
	/**
	 * Returns data to apply to template. Override this if needed
	 * @param {Mixed} value
	 * @param {Object} cell object to set some attributes of the grid cell
	 * @param {Ext.data.Record} record from which the data is extracted
	 * @param {Number} row row index
	 * @param {Number} col col index
	 * @param {Ext.data.Store} store object from which the record is extracted
	 * @returns {Object} data to apply to template
	 */
	,
	getData: function(value, cell, record, row, col, store) {
		return record.data || {};
	}	// }}}
	// {{{
	/**
	 * replaces (but calls) the original renderer from column model
	 * @private
	 * @param {Mixed} value
	 * @param {Object} cell object to set some attributes of the grid cell
	 * @param {Ext.data.Record} record from which the data is extracted
	 * @param {Number} row row index
	 * @param {Number} col col index
	 * @param {Ext.data.Store} store object from which the record is extracted
	 * @returns {String} markup of cell content
	 */
	,
	renderActions: function(value, cell, record, row, col, store) {
	
		// get column config from column model
		var c = this.grid.getColumnModel().config[col];
		
		// get output of the original renderer
		var val = c.origRenderer(value, cell, record, row, col, store);
		
		// get actions template if we need but don't have one
		if (c.cellActions && !c.actionsTpl) {
			c.actionsTpl = this.processActions(c);
			c.actionsTpl.compile();
		}  // return original renderer output if we don't have actions
		else if (!c.cellActions) {
			return val;
		}
		
		// get and return final markup
		var data = this.getData.apply(this, arguments);
		data.value = val;
		return c.actionsTpl.apply(data);
		
	} // eo function renderActions
	// }}}
	// {{{
	/**
	 * processes the actions configs from column model column, saves callbacks and creates template
	 * @param {Object} c column model config of one column
	 * @private
	 */
	,
	processActions: function(c) {
	
		// callbacks holder
		this.callbacks = this.callbacks || {};
		
		// data for intermediate template
		var data = {
			align: this.align || 'right',
			width: this.actionWidth * c.cellActions.length,
			padding: 'left' === this.align ? this.actionWidth * c.cellActions.length : 0,
			value: '{value}',
			actions: []
		};
		
		// cellActions loop
		Ext.each(c.cellActions, function(a, i) {
		
			// save callback
			if (a.iconCls && 'function' === typeof(a.callback || a.cb)) {
				this.callbacks[a.iconCls] = a.callback || a.cb;
			}
			
			// data for intermediate xtemplate action
			var o = {
				cls: a.iconIndex ? '{' + a.iconIndex + '}' : (a.iconCls ? a.iconCls : ''),
				qtip: a.qtipIndex ? '{' + a.qtipIndex + '}' : (a.tooltip || a.qtip ? a.tooltip || a.qtip : ''),
				style: a.style ? a.style : ''
			};
			data.actions.push(o);
			
		}, this); // eo cellActions loop
		this.userProcessing(c, data);
		
		// get and return final template
		var xt = new Ext.XTemplate(this.tpl);
		return new Ext.Template(xt.apply(data));
		
	} // eo function processActions
	// }}}
	// {{{
	/**
	 * Grid body actionEvent event handler
	 * @private
	 */
	,
	onClick: function(e, target) {
	
		// collect all variables for callback and/or events
		var t = e.getTarget('div.ux-cell-action');
		var row = e.getTarget('.x-grid3-row');
		var col = this.view.findCellIndex(target.parentNode.parentNode);
		var c = this.grid.getColumnModel().config[col];
		var record, dataIndex, value, action;
		if (t) {
			record = this.grid.store.getAt(row.rowIndex);
			dataIndex = c.dataIndex;
			value = record.get(dataIndex);
			action = t.className.replace(/ux-cell-action /, '');
		}
		
		// check if we've collected all necessary variables
		if (false !== row && false !== col && record && dataIndex && action) {
		
			// call callback if any
			if (this.callbacks && 'function' === typeof this.callbacks[action]) {
				this.callbacks[action](this.grid, record, action, value, dataIndex, row.rowIndex, col);
			}
			
			// fire events
			if (true !== this.eventsSuspended && false === this.fireEvent('beforeaction', this.grid, record, action, value, dataIndex, row.rowIndex, col)) {
				return;
			} else if (true !== this.eventsSuspended) {
				this.fireEvent('action', this.grid, record, action, value, dataIndex, row.rowIndex, col);
			}
			
		}
	} // eo function onClick
	// }}}

});

// register xtype
Ext.reg('cellactions', Ext.ux.grid.CellActions);

// eof
/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/**
 * @class Ext.DataView.LabelEditor
 * @extends Ext.Editor
 * 
 */
Ext.DataView.LabelEditor = Ext.extend(Ext.Editor, {
    alignment: "tl-tl",
    hideEl : false,
    cls: "x-small-editor",
    shim: false,
    completeOnEnter: true,
    cancelOnEsc: true,
    labelSelector: 'span.x-editable',
    
    constructor: function(cfg, field){
        Ext.DataView.LabelEditor.superclass.constructor.call(this,
            field || new Ext.form.TextField({
                allowBlank: false,
                growMin:90,
                growMax:240,
                grow:true,
                selectOnFocus:true
            }), cfg
        );
    },
    
    init : function(view){
        this.view = view;
        view.on('render', this.initEditor, this);
        this.on('complete', this.onSave, this);
    },

    initEditor : function(){
        this.view.on({
            scope: this,
            containerclick: this.doBlur,
            click: this.doBlur
        });
        this.view.getEl().on('mousedown', this.onMouseDown, this, {delegate: this.labelSelector});
    },
    
    doBlur: function(){
        if(this.editing){
            this.field.blur();
        }
    },

    onMouseDown : function(e, target){
        if(!e.ctrlKey && !e.shiftKey){
            var item = this.view.findItemFromChild(target);
            e.stopEvent();
            var record = this.view.store.getAt(this.view.indexOf(item));
            this.startEdit(target, record.data[this.dataIndex]);
            this.activeRecord = record;
        }else{
            e.preventDefault();
        }
    },

    onSave : function(ed, value){
        this.activeRecord.set(this.dataIndex, value);
    }
});


Ext.DataView.DragSelector = function(cfg){
    cfg = cfg || {};
    var view, proxy, tracker;
    var rs, bodyRegion, dragRegion = new Ext.lib.Region(0,0,0,0);
    var dragSafe = cfg.dragSafe === true;

    this.init = function(dataView){
        view = dataView;
        view.on('render', onRender);
    };

    function fillRegions(){
        rs = [];
        view.all.each(function(el){
            rs[rs.length] = el.getRegion();
        });
        bodyRegion = view.el.getRegion();
    }

    function cancelClick(){
        return false;
    }

    function onBeforeStart(e){
        return !dragSafe || e.target == view.el.dom;
    }

    function onStart(e){
        view.on('containerclick', cancelClick, view, {single:true});
        if(!proxy){
            proxy = view.el.createChild({cls:'x-view-selector'});
        }else{
            if(proxy.dom.parentNode !== view.el.dom){
                view.el.dom.appendChild(proxy.dom);
            }
            proxy.setDisplayed('block');
        }
        fillRegions();
        view.clearSelections();
    }

    function onDrag(e){
        var startXY = tracker.startXY;
        var xy = tracker.getXY();

        var x = Math.min(startXY[0], xy[0]);
        var y = Math.min(startXY[1], xy[1]);
        var w = Math.abs(startXY[0] - xy[0]);
        var h = Math.abs(startXY[1] - xy[1]);

        dragRegion.left = x;
        dragRegion.top = y;
        dragRegion.right = x+w;
        dragRegion.bottom = y+h;

        dragRegion.constrainTo(bodyRegion);
        proxy.setRegion(dragRegion);

        for(var i = 0, len = rs.length; i < len; i++){
            var r = rs[i], sel = dragRegion.intersect(r);
            if(sel && !r.selected){
                r.selected = true;
                view.select(i, true);
            }else if(!sel && r.selected){
                r.selected = false;
                view.deselect(i);
            }
        }
    }

    function onEnd(e){
        if (!Ext.isIE) {
            view.un('containerclick', cancelClick, view);    
        }        
        if(proxy){
            proxy.setDisplayed(false);
        }
    }

    function onRender(view){
        tracker = new Ext.dd.DragTracker({
            onBeforeStart: onBeforeStart,
            onStart: onStart,
            onDrag: onDrag,
            onEnd: onEnd
        });
        tracker.initEl(view.el);
    }
};/*!
 * Ext JS Library 3.2.0
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/**
 * @class Ext.ux.StatusBar
 * <p>Basic status bar component that can be used as the bottom toolbar of any {@link Ext.Panel}.  In addition to
 * supporting the standard {@link Ext.Toolbar} interface for adding buttons, menus and other items, the StatusBar
 * provides a greedy status element that can be aligned to either side and has convenient methods for setting the
 * status text and icon.  You can also indicate that something is processing using the {@link #showBusy} method.</p>
 * <pre><code>
new Ext.Panel({
    title: 'StatusBar',
    // etc.
    bbar: new Ext.ux.StatusBar({
        id: 'my-status',

        // defaults to use when the status is cleared:
        defaultText: 'Default status text',
        defaultIconCls: 'default-icon',

        // values to set initially:
        text: 'Ready',
        iconCls: 'ready-icon',

        // any standard Toolbar items:
        items: [{
            text: 'A Button'
        }, '-', 'Plain Text']
    })
});

// Update the status bar later in code:
var sb = Ext.getCmp('my-status');
sb.setStatus({
    text: 'OK',
    iconCls: 'ok-icon',
    clear: true // auto-clear after a set interval
});

// Set the status bar to show that something is processing:
sb.showBusy();

// processing....

sb.clearStatus(); // once completeed
</code></pre>
 * @extends Ext.Toolbar
 * @constructor
 * Creates a new StatusBar
 * @param {Object/Array} config A config object
 */
Ext.ux.StatusBar = Ext.extend(Ext.Toolbar, {
    /**
     * @cfg {String} statusAlign
     * The alignment of the status element within the overall StatusBar layout.  When the StatusBar is rendered,
     * it creates an internal div containing the status text and icon.  Any additional Toolbar items added in the
     * StatusBar's {@link #items} config, or added via {@link #add} or any of the supported add* methods, will be
     * rendered, in added order, to the opposite side.  The status element is greedy, so it will automatically
     * expand to take up all sapce left over by any other items.  Example usage:
     * <pre><code>
// Create a left-aligned status bar containing a button,
// separator and text item that will be right-aligned (default):
new Ext.Panel({
    title: 'StatusBar',
    // etc.
    bbar: new Ext.ux.StatusBar({
        defaultText: 'Default status text',
        id: 'status-id',
        items: [{
            text: 'A Button'
        }, '-', 'Plain Text']
    })
});

// By adding the statusAlign config, this will create the
// exact same toolbar, except the status and toolbar item
// layout will be reversed from the previous example:
new Ext.Panel({
    title: 'StatusBar',
    // etc.
    bbar: new Ext.ux.StatusBar({
        defaultText: 'Default status text',
        id: 'status-id',
        statusAlign: 'right',
        items: [{
            text: 'A Button'
        }, '-', 'Plain Text']
    })
});
</code></pre>
     */
    /**
     * @cfg {String} defaultText
     * The default {@link #text} value.  This will be used anytime the status bar is cleared with the
     * <tt>useDefaults:true</tt> option (defaults to '').
     */
    /**
     * @cfg {String} defaultIconCls
     * The default {@link #iconCls} value (see the iconCls docs for additional details about customizing the icon).
     * This will be used anytime the status bar is cleared with the <tt>useDefaults:true</tt> option (defaults to '').
     */
    /**
     * @cfg {String} text
     * A string that will be <b>initially</b> set as the status message.  This string
     * will be set as innerHTML (html tags are accepted) for the toolbar item.
     * If not specified, the value set for <code>{@link #defaultText}</code>
     * will be used.
     */
    /**
     * @cfg {String} iconCls
     * A CSS class that will be <b>initially</b> set as the status bar icon and is
     * expected to provide a background image (defaults to '').
     * Example usage:<pre><code>
// Example CSS rule:
.x-statusbar .x-status-custom {
    padding-left: 25px;
    background: transparent url(images/custom-icon.gif) no-repeat 3px 2px;
}

// Setting a default icon:
var sb = new Ext.ux.StatusBar({
    defaultIconCls: 'x-status-custom'
});

// Changing the icon:
sb.setStatus({
    text: 'New status',
    iconCls: 'x-status-custom'
});
</code></pre>
     */

    /**
     * @cfg {String} cls
     * The base class applied to the containing element for this component on render (defaults to 'x-statusbar')
     */
    cls : 'x-statusbar',
    /**
     * @cfg {String} busyIconCls
     * The default <code>{@link #iconCls}</code> applied when calling
     * <code>{@link #showBusy}</code> (defaults to <tt>'x-status-busy'</tt>).
     * It can be overridden at any time by passing the <code>iconCls</code>
     * argument into <code>{@link #showBusy}</code>.
     */
    busyIconCls : 'x-status-busy',
    /**
     * @cfg {String} busyText
     * The default <code>{@link #text}</code> applied when calling
     * <code>{@link #showBusy}</code> (defaults to <tt>'Loading...'</tt>).
     * It can be overridden at any time by passing the <code>text</code>
     * argument into <code>{@link #showBusy}</code>.
     */
    busyText : 'Loading...',
    /**
     * @cfg {Number} autoClear
     * The number of milliseconds to wait after setting the status via
     * <code>{@link #setStatus}</code> before automatically clearing the status
     * text and icon (defaults to <tt>5000</tt>).  Note that this only applies
     * when passing the <tt>clear</tt> argument to <code>{@link #setStatus}</code>
     * since that is the only way to defer clearing the status.  This can
     * be overridden by specifying a different <tt>wait</tt> value in
     * <code>{@link #setStatus}</code>. Calls to <code>{@link #clearStatus}</code>
     * always clear the status bar immediately and ignore this value.
     */
    autoClear : 5000,

    /**
     * @cfg {String} emptyText
     * The text string to use if no text has been set.  Defaults to
     * <tt>'&nbsp;'</tt>).  If there are no other items in the toolbar using
     * an empty string (<tt>''</tt>) for this value would end up in the toolbar
     * height collapsing since the empty string will not maintain the toolbar
     * height.  Use <tt>''</tt> if the toolbar should collapse in height
     * vertically when no text is specified and there are no other items in
     * the toolbar.
     */
    emptyText : '&nbsp;',

    // private
    activeThreadId : 0,

    // private
    initComponent : function(){
        if(this.statusAlign=='right'){
            this.cls += ' x-status-right';
        }
        Ext.ux.StatusBar.superclass.initComponent.call(this);
    },

    // private
    afterRender : function(){
        Ext.ux.StatusBar.superclass.afterRender.call(this);

        var right = this.statusAlign == 'right';
        this.currIconCls = this.iconCls || this.defaultIconCls;
        this.statusEl = new Ext.Toolbar.TextItem({
            cls: 'x-status-text ' + (this.currIconCls || ''),
            text: this.text || this.defaultText || ''
        });

        if(right){
            this.add('->');
            this.add(this.statusEl);
        }else{
            this.insert(0, this.statusEl);
            this.insert(1, '->');
        }
        this.doLayout();
    },

    /**
     * Sets the status {@link #text} and/or {@link #iconCls}. Also supports automatically clearing the
     * status that was set after a specified interval.
     * @param {Object/String} config A config object specifying what status to set, or a string assumed
     * to be the status text (and all other options are defaulted as explained below). A config
     * object containing any or all of the following properties can be passed:<ul>
     * <li><tt>text</tt> {String} : (optional) The status text to display.  If not specified, any current
     * status text will remain unchanged.</li>
     * <li><tt>iconCls</tt> {String} : (optional) The CSS class used to customize the status icon (see
     * {@link #iconCls} for details). If not specified, any current iconCls will remain unchanged.</li>
     * <li><tt>clear</tt> {Boolean/Number/Object} : (optional) Allows you to set an internal callback that will
     * automatically clear the status text and iconCls after a specified amount of time has passed. If clear is not
     * specified, the new status will not be auto-cleared and will stay until updated again or cleared using
     * {@link #clearStatus}. If <tt>true</tt> is passed, the status will be cleared using {@link #autoClear},
     * {@link #defaultText} and {@link #defaultIconCls} via a fade out animation. If a numeric value is passed,
     * it will be used as the callback interval (in milliseconds), overriding the {@link #autoClear} value.
     * All other options will be defaulted as with the boolean option.  To customize any other options,
     * you can pass an object in the format:<ul>
     *    <li><tt>wait</tt> {Number} : (optional) The number of milliseconds to wait before clearing
     *    (defaults to {@link #autoClear}).</li>
     *    <li><tt>anim</tt> {Number} : (optional) False to clear the status immediately once the callback
     *    executes (defaults to true which fades the status out).</li>
     *    <li><tt>useDefaults</tt> {Number} : (optional) False to completely clear the status text and iconCls
     *    (defaults to true which uses {@link #defaultText} and {@link #defaultIconCls}).</li>
     * </ul></li></ul>
     * Example usage:<pre><code>
// Simple call to update the text
statusBar.setStatus('New status');

// Set the status and icon, auto-clearing with default options:
statusBar.setStatus({
    text: 'New status',
    iconCls: 'x-status-custom',
    clear: true
});

// Auto-clear with custom options:
statusBar.setStatus({
    text: 'New status',
    iconCls: 'x-status-custom',
    clear: {
        wait: 8000,
        anim: false,
        useDefaults: false
    }
});
</code></pre>
     * @return {Ext.ux.StatusBar} this
     */
    setStatus : function(o){
        o = o || {};

        if(typeof o == 'string'){
            o = {text:o};
        }
        if(o.text !== undefined){
            this.setText(o.text);
        }
        if(o.iconCls !== undefined){
            this.setIcon(o.iconCls);
        }

        if(o.clear){
            var c = o.clear,
                wait = this.autoClear,
                defaults = {useDefaults: true, anim: true};

            if(typeof c == 'object'){
                c = Ext.applyIf(c, defaults);
                if(c.wait){
                    wait = c.wait;
                }
            }else if(typeof c == 'number'){
                wait = c;
                c = defaults;
            }else if(typeof c == 'boolean'){
                c = defaults;
            }

            c.threadId = this.activeThreadId;
            this.clearStatus.defer(wait, this, [c]);
        }
        return this;
    },

    /**
     * Clears the status {@link #text} and {@link #iconCls}. Also supports clearing via an optional fade out animation.
     * @param {Object} config (optional) A config object containing any or all of the following properties.  If this
     * object is not specified the status will be cleared using the defaults below:<ul>
     * <li><tt>anim</tt> {Boolean} : (optional) True to clear the status by fading out the status element (defaults
     * to false which clears immediately).</li>
     * <li><tt>useDefaults</tt> {Boolean} : (optional) True to reset the text and icon using {@link #defaultText} and
     * {@link #defaultIconCls} (defaults to false which sets the text to '' and removes any existing icon class).</li>
     * </ul>
     * @return {Ext.ux.StatusBar} this
     */
    clearStatus : function(o){
 		/* SYNO: make sure status bar exists */
		if (this.isDestroyed) {
			return;
		}

       o = o || {};

        if(o.threadId && o.threadId !== this.activeThreadId){
            // this means the current call was made internally, but a newer
            // thread has set a message since this call was deferred.  Since
            // we don't want to overwrite a newer message just ignore.
            return this;
        }

        var text = o.useDefaults ? this.defaultText : this.emptyText,
            iconCls = o.useDefaults ? (this.defaultIconCls ? this.defaultIconCls : '') : '';

        if(o.anim){
            // animate the statusEl Ext.Element
            this.statusEl.el.fadeOut({
                remove: false,
                useDisplay: true,
                scope: this,
                callback: function(){
					/* SYNO: make sure status bar exists */
					if (this.isDestroyed) {
						return;
					}
                    this.setStatus({
	                    text: text,
	                    iconCls: iconCls
	                });

                    this.statusEl.el.show();
                }
            });
        }else{
            // hide/show the el to avoid jumpy text or icon
            this.statusEl.hide();
	        this.setStatus({
	            text: text,
	            iconCls: iconCls
	        });
            this.statusEl.show();
        }
        return this;
    },

    /**
     * Convenience method for setting the status text directly.  For more flexible options see {@link #setStatus}.
     * @param {String} text (optional) The text to set (defaults to '')
     * @return {Ext.ux.StatusBar} this
     */
    setText : function(text){
        this.activeThreadId++;
        this.text = text || '';
        if(this.rendered){
            this.statusEl.setText(this.text);
        }
        return this;
    },

    /**
     * Returns the current status text.
     * @return {String} The status text
     */
    getText : function(){
        return this.text;
    },

    /**
     * Convenience method for setting the status icon directly.  For more flexible options see {@link #setStatus}.
     * See {@link #iconCls} for complete details about customizing the icon.
     * @param {String} iconCls (optional) The icon class to set (defaults to '', and any current icon class is removed)
     * @return {Ext.ux.StatusBar} this
     */
    setIcon : function(cls){
        this.activeThreadId++;
        cls = cls || '';

        if(this.rendered){
	        if(this.currIconCls){
	            this.statusEl.removeClass(this.currIconCls);
	            this.currIconCls = null;
	        }
	        if(cls.length > 0){
	            this.statusEl.addClass(cls);
	            this.currIconCls = cls;
	        }
        }else{
            this.currIconCls = cls;
        }
        return this;
    },

    /**
     * Convenience method for setting the status text and icon to special values that are pre-configured to indicate
     * a "busy" state, usually for loading or processing activities.
     * @param {Object/String} config (optional) A config object in the same format supported by {@link #setStatus}, or a
     * string to use as the status text (in which case all other options for setStatus will be defaulted).  Use the
     * <tt>text</tt> and/or <tt>iconCls</tt> properties on the config to override the default {@link #busyText}
     * and {@link #busyIconCls} settings. If the config argument is not specified, {@link #busyText} and
     * {@link #busyIconCls} will be used in conjunction with all of the default options for {@link #setStatus}.
     * @return {Ext.ux.StatusBar} this
     */
    showBusy : function(o){
        if(typeof o == 'string'){
            o = {text:o};
        }
        o = Ext.applyIf(o || {}, {
            text: this.busyText,
            iconCls: this.busyIconCls
        });
        return this.setStatus(o);
    }
});
Ext.reg('statusbar', Ext.ux.StatusBar);
Ext.ns('SYNO');
SYNO.CellActions = Ext.extend(Ext.ux.grid.CellActions, {
	overClass: 'ux-cell-action-over',
	clickClass: 'ux-cell-action-click',
	onRenderGrid: function() {
		SYNO.CellActions.superclass.onRenderGrid.apply(this, arguments);
		this.grid.mon(this.view.mainBody, 'mouseover', this.onMouseOver, this);
		this.grid.on('destroy', this.destroy, this, {
			single: true
		});
	},
	getTargetEl: function(e) {
		return e.getTarget('div.ux-cell-action');
	},
	onMouseOver: function(e) {
		var t = this.getTargetEl(e);
		if (t && t !== this.lastItem) {
			this.lastItem = t;
			var el = Ext.get(t);
			el.addClass(this.overClass);
			el.on("mouseout", this.onMouseOut, this);
		}
	},
	onMouseOut: function(e) {
		if (this.lastItem) {
			if (!e.within(this.lastItem, true, true)) {
				Ext.fly(this.lastItem).removeClass(this.overClass);
				delete this.lastItem;
			}
		}
	},
	onClick: function(e) {
		var t = this.getTargetEl(e);
		if (t) {
			Ext.fly(t).addClass(this.clickClass);
			Ext.getDoc().on('mouseup', this.onMouseUp, this);
			SYNO.CellActions.superclass.onClick.apply(this, arguments);
		}
	},
	onMouseUp: function(e) {
		var t = this.getTargetEl(e);
		if (t) {
			Ext.fly(t).removeClass(this.clickClass);
			Ext.getDoc().un('mouseup', this.onMouseUp, this);
		}
	},
	destroy: function() {
		Ext.getDoc().un('mouseup', this.onMouseUp, this);
		this.purgeListeners();
	}
});

Ext.namespace('SYNO');

SYNO.ColorField = Ext.extend(Ext.form.TriggerField, {
	defaultAutoCreate : {tag: "input", type: "text", size: "10", maxlength: "7", autocomplete: "off"},
	allowBlank: false,
	maskRe: /[#a-f0-9]/i,
	menu: null,
	constructor: function(config) {
		SYNO.ColorField.superclass.constructor.apply(this, arguments);
		this.menu = new Ext.menu.ColorMenu();
		this.mon(this.menu.palette, 'select', this.onColorSelect, this);
		this.addManagedComponent(this.menu);
	},
	validateBlur : function(){
		return !this.menu || !this.menu.isVisible();
	},
	validator: function(value){
		var colorHex = /^#[a-f0-9]{3}([a-f0-9]{3})?$/i;
		return value && value.match(colorHex) ? true : '';
	},
	onTriggerClick: function() {
		if(this.disabled) {
			return;
		}
		this.menu.show(this.el, "tl-bl?");
	},
	onColorSelect: function(palette, color) {
		this.setValue('#' + color);
	}
});

Ext.reg('colorfield', SYNO.ColorField);
Ext.ns('SYNO');

SYNO.CustRadio = Ext.extend(Ext.form.Radio, {
	ctCls: 'syno-radiobox',
	overCls: 'x-checkbox-over',
	values: [false, true],
	checkedCls: [null, 'x-checkbox-checked'],
	onRender: function(ct, position) {
		SYNO.CustRadio.superclass.onRender.call(this, ct, position);
		this.boxEl = this.el.next();
		this.container.addClassOnOver(this.overCls);
	},
	initValue : function() {
		SYNO.CustRadio.superclass.initValue.apply(this, arguments);
		this.setValue(this.getValue());
	},
	updateCheckCls: function() {
		if (!this.boxEl) {
			return;
		}
		var cls = this.checkedCls[this.getValue() ? 1 : 0];
		this.boxEl.replaceClass(this._checkCls, cls);
		this._checkCls = cls;
	},
	setValue: function(v) {
		SYNO.CustRadio.superclass.setValue.call(this, v);
		this.updateCheckCls();
		return this;
	}
});
//////////////////////////////////////////////////////////////////////////
// Customized tree node UI                                              //
// - Customized icon support (by inherenting TreeNodeUI)                //
// - Four-state combobox support (by extending TriTreeNodeUI)           //
// - Text field support (Customized in this class)                      //
//////////////////////////////////////////////////////////////////////////

Ext.tree.CustTreeNodeUI = function() {
	Ext.tree.CustTreeNodeUI.superclass.constructor.apply(this, arguments);
};

Ext.tree.CustTreeNodeUI.HIDESTATE = 3;
Ext.tree.CustTreeNodeUI.CHECKSTATE = 2;
Ext.tree.CustTreeNodeUI.UNCHECKSTATE = 1;
Ext.tree.CustTreeNodeUI.GRAYSTATE = 0;

Ext.extend(Ext.tree.CustTreeNodeUI, Ext.tree.TreeNodeUI,{
	values: [null, false, true],
	checkedCls: ['x-checkbox-grayed', null, 'x-checkbox-checked'],
	checkboxCls: 'x-checkbox',
	expanded: false,
	err: -1,
	textField: null,
	showTextFieldAlways: false,
		   
	initEvents: function(){
		Ext.tree.CustTreeNodeUI.superclass.initEvents.apply(this, arguments);
		if (this.checkbox){
			Ext.EventManager.on(this.checkbox, 'click', this.toggleCheck, this);
		}
	},
	destroy: function(){
		if (this.checkbox){
			Ext.EventManager.un(this.checkbox, 'click', this.toggleCheck, this);
		}
		Ext.tree.CustTreeNodeUI.superclass.destroy.apply(this, arguments);
	},
	getCheckIndex: function(n){
		for (var i = 0; i < this.values.length; i++){
			if (n.getUI() && n.getUI().checkbox &&
				n.getUI().checkbox.checked === this.values[i]){
				return i;
			}
		}

		return this.err;
	},
	getTextValue: function(n){
		// Check component is hidden or not
		return n.getUI().textField.value;
	},
	setTextValue: function(n, v){
		n.getUI().textField.value = v;
	},
	clearCheck: function(){
		if (true === this.node.disabled){
			return;
		}
		this.onCheckChange(Ext.tree.CustTreeNodeUI.UNCHECKSTATE);
	},
	onCheckChange: function(index){
		this.checkbox.checked = this.values[index];
		this.checkbox.className = this.checkedCls[index];
		if (this.node.firstChild){
			this.updateChild(this.node.firstChild, index);
		}
		if (this.node.parentNode != this.root){
			this.updateParent(this.node.parentNode, index);
		}
		var checked = this.checkbox.checked;
		this.node.attributes.checked = checked;
		this.fireEvent('checkchange', this.node, checked);
	},
	toggleCheck: function(){
		if (true === this.node.disabled){
			return;
		}
		var index = this.getCheckIndex(this.node);
		index = (index === Ext.tree.CustTreeNodeUI.UNCHECKSTATE) ? Ext.tree.CustTreeNodeUI.CHECKSTATE : Ext.tree.CustTreeNodeUI.UNCHECKSTATE;
		  
		this.onCheckChange(index);
	},
	updateChild: function(fd, index){
		var tmpNode = fd;
		do{
			if (tmpNode.disabled){
				tmpNode = tmpNode.nextSibling;
				continue;
			}
			if (tmpNode.getUI() && tmpNode.getUI().checkbox) {
				tmpNode.getUI().checkbox.checked = this.values[index];
				tmpNode.getUI().checkbox.className = this.checkedCls[index];
			}
			if (tmpNode.firstChild){
				this.updateChild(tmpNode.firstChild, index);
			}
			tmpNode = tmpNode.nextSibling;
		} while (tmpNode);
	},
	updateParent: function(p, callerstate){
		var calledstate = this.getCheckIndex(p);
		if (callerstate != calledstate){
			var index = this.checkchildstate(p);

			if (p.getUI() && p.getUI().checkbox) {
				p.getUI().checkbox.checked = this.values[index];
				p.getUI().checkbox.className = this.checkedCls[index];
			}
			if (p.parentNode != this.root){
				this.updateParent(p.parentNode, index);
			}
		}
	},
	checkchildstate: function(parent_node){
		var tmpNode = parent_node.firstChild;
		var i;
		if (!tmpNode){
			return this.err;
		}
		while (tmpNode){
			if (Ext.tree.CustTreeNodeUI.UNCHECKSTATE !== this.getCheckIndex(tmpNode)){
				return Ext.tree.CustTreeNodeUI.GRAYSTATE;
			}
			tmpNode = tmpNode.nextSibling;
		}
		return Ext.tree.CustTreeNodeUI.UNCHECKSTATE;
	},
		  
	renderElements: function(n, a, targetNode, bulkRender){
		this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';

		var inputType = (undefined === a.inputType)?"text":a.inputType;

		var nel, href = a.href ? a.href : Ext.isGecko ? "" : "#", 
		buf = ['<li class="x-tree-node">',
				'<div ext:tree-node-id="', Ext.util.Format.htmlEncode(n.id), '" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls, '" unselectable="on">', 

				'<span class="x-tree-node-indent">', this.indentMarkup, "</span>", 
				'<img alt="" src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />', 
				'<img alt="" src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon', (a.icon ? " x-tree-node-inline-icon" : ""), (a.iconCls ? " " + a.iconCls : ""), '" unselectable="on" />', 
				'<span><img alt="" src="' + this.emptyIcon + '" style="margin:0 2px 0 2px;" class="x-checkbox" /></span>', 
				'<a hidefocus="on" class="x-tree-node-anchor" href="', href, '" tabIndex="1" ', a.hrefTarget ? ' target="' + a.hrefTarget + '"' : "", '><span unselectable="on">', n.text, "</span></a>",
				'<input style="width:140px;" class="x-form-text x-form-field" type=' + inputType + '></input>',
				"</div>",

				'<ul class="x-tree-node-ct" style="display:none;"></ul>', 
				"</li>"].join('');

		if (bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl())){
			this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
		}else{
			this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
		}
		  
		this.elNode = this.wrap.childNodes[0];
		this.ctNode = this.wrap.childNodes[1];
		var cs = this.elNode.childNodes;

		// Indent part
		this.indentNode = cs[0];

		// Expand part
		this.ecNode = cs[1];

		// Icon part
		this.iconNode = cs[2];      

		// Check box part
		this.checkbox = cs[3];
		if (a.checked === "checked"){
			this.checkbox.checked = this.values[Ext.tree.CustTreeNodeUI.CHECKSTATE];
			this.checkbox.className = this.checkedCls[Ext.tree.CustTreeNodeUI.CHECKSTATE];
		}else if (a.checked === "gray"){
			this.checkbox.checked = this.values[Ext.tree.CustTreeNodeUI.GRAYSTATE];
			this.checkbox.className = this.checkedCls[Ext.tree.CustTreeNodeUI.GRAYSTATE];
		}else if (a.checked === "unchecked"){
			this.checkbox.checked = this.values[Ext.tree.CustTreeNodeUI.UNCHECKSTATE];
			this.checkbox.className = this.checkedCls[Ext.tree.CustTreeNodeUI.UNCHECKSTATE];
		}else{
			// Hide check box for any other values
			this.checkbox.hide();
		}

		// Display part
		this.anchor = cs[4];
		this.textNode = cs[4].firstChild;

		// Text part
		this.textField = cs[5];
		if (true !== a.showTextField){
			this.textField.hide();
		}
		// Text field value initialization
		if (a.textValue) {
			this.textField.value = a.textValue;
		}
		// Config to show text field always
		this.showTextFieldAlways = a.showTextFieldAlways;
	},
	onClick : function(e){
		if(this.dropping){
			e.stopEvent();
			return;
		}
		if(this.fireEvent("beforeclick", this.node, e) !== false){
			var a = e.getTarget('a');
			if(!this.disabled && this.node.attributes.href && a){
				this.fireEvent("click", this.node, e);
				return;
			}else if(a && e.ctrlKey){
				e.stopEvent();
			}
			e.preventDefault();
			if(this.disabled){
				return;
			}

			if(this.node.attributes.singleClickExpand && !this.animating && this.node.isExpandable()){
				this.node.toggle();
			}

			this.fireEvent("click", this.node, e);

			if (true === this.node.attributes.showTextField){
				// I overwrite onClick here,
				// because after firing event, the focus will be removed form text field.
				// I need to focus text field again.
				this.textField.focus();  
			}
		}else{
			e.stopEvent();
		}
	},
	onDisableChange : function(node, state){
		// Disable check box
		this.disabled = state;
		if (this.checkbox) {
			this.checkbox.disabled = state;
		}
		// Disable tree
		if(state){
			this.addClass("x-tree-node-disabled");
		}else{
			this.removeClass("x-tree-node-disabled");
		}
		// Disable text field
		if (this.textField) {
			if (this.showTextFieldAlways) {
				this.textField.disabled = false;
			} else {
				this.textField.disabled = state;
			}
		}
	}
});
Ext.namespace("SYNO");

/**
 * @class SYNO.EnableColumn
 * @extends  Ext.grid.Column
 * <pre><code>
 		var enableColumn = new SYNO.EnableColumn({
			header: 'Enabled',
			dataIndex: 'enabled',
			width: 80,
			align: 'center'
		});
		var cm = new Ext.grid.ColumnModel([
			enableColumn,
			{ header: 'Service', dataIndex: 'service', id: 'service'},
			...
		]);
		var gridPanel = new Ext.grid.GridPanel({
			cm: cm,
			plugins: [enableColumn],
			...
		});
 </pre></code>
 @cfg {Boolean} commitChanges commit changes after disable/enable cell
 @cfg {Boolean} enableFastSelectAll suspend store event when select all
 @cfg {Boolean} disableSelectAll remove selectAll check box on header and disable selectAll function
 */
SYNO.EnableColumn = Ext.extend(Ext.grid.Column, {
	commitChanges: false,
	bindRowClick: false,
	enableFastSelectAll: false,
	disableSelectAll: false,

	constructor: function(config) { 
		var tag = '<input id="{0}" type="checkbox" style="height:10px;vertical-align:middle">&nbsp;{1}';
		this.box_id = Ext.id();

		if (!config.disableSelectAll) {
			config.header = String.format(tag, this.box_id, config.header || '');
		}

		SYNO.EnableColumn.superclass.constructor.call(this, config);
	},
	init: function(grid) {
		if (!Ext.isDefined(this.dataIndex) || !Ext.isDefined(this.id)) {
			throw Error("you should set dataIndex and id for EnableColumn");
		}

		grid.mon(grid, 'cellclick', function(grid, row, col, event) {
			if (grid.getColumnModel().getColumnId(col) === this.id || this.bindRowClick) {
				this.onCellClick(grid, row, event);
			}
		}, this);
		
		grid.mon(grid, 'headerclick', function(grid, col, evt) {
			var elem;
			
			if (grid.getColumnModel().getColumnId(col) === this.id || this.bindRowClick) {
				elem = evt.getTarget('input', 1, true);
				if (elem) {
					this.onSelectAll();
				}
			}
		}, this);

		grid.mon(grid, 'afterrender', function(grid) {
			this.box_el = Ext.get(this.box_id);
			grid.mon(grid.getStore(), 'add', this.checkSelectAll, this);
			grid.mon(grid.getStore(), 'remove', this.checkSelectAll, this);
			grid.mon(grid.getStore(), 'load', this.checkSelectAll, this);
			grid.mon(grid.getColumnModel(), 'columnmoved', this.onColumnMoved, this);
			grid.mon(grid.getColumnModel(), 'headerchange', this.onHeaderChange, this);
			grid.mon(grid.getView(), 'refresh', this.onHeaderChange, this);
			this.checkSelectAll(grid.getStore());
		}, this, {single: true});

		this.getGrid = function() {
			return grid;
		};
	},
	isIgnore: function(fid, rec) {
		return false;
	},
	toggleRec: function(rec) {
		var val = rec.get(this.dataIndex);
		if ('gray' === val) {
			val = false;
		}
		rec.set(this.dataIndex, !val);
	},
	onColumnMoved: function() {
		this.box_el = Ext.get(this.box_id);
		this.checkSelectAll(this.getGrid().getStore());
	},
	onHeaderChange: function() {
		this.box_el = Ext.get(this.box_id);
		this.checkSelectAll(this.getGrid().getStore());
	},
	onSelectAll: function() {
		var ds, i, val, total, isEnable;

		if (!this.box_el || !this.box_el.dom) {
			return;
		}
		ds = this.getGrid().getStore();
		isEnable = !!(this.box_el.dom.checked);

		if (this.enableFastSelectAll) {
			ds.suspendEvents();
		}
		for (i = 0, total = ds.getCount() ; i < total ; i++) {
			val = ds.getAt(i).get(this.dataIndex);

			if (('gray' !== val && !!(val) === isEnable) ||
				this.isIgnore('all', ds.getAt(i))) {
				continue;
			}

			this.toggleRec(ds.getAt(i));
		}

		if (this.enableFastSelectAll) {
			this.getGrid().getView().refresh();
			ds.resumeEvents();
		}

		if (this.commitChanges) {
			ds.commitChanges();
		}

		this.checkSelectAll(ds);
	},
	onCellClick: function(grid, row, event) {
		var ds = grid.getStore();

		if (this.isIgnore('cell', ds.getAt(row))) {
			return;
		}

		ds = grid.getStore();
		this.toggleRec(ds.getAt(row));

		if (this.commitChanges) {
			ds.commitChanges();
		}

		this.checkSelectAll(ds);
	},
	checkSelectAll: function(ds) {
		var i, val, total = ds.getCount();
		var isAllEnable = (total > 0);

		if (!this.box_el || !this.box_el.dom) {
			return;
		}

		for (i = 0 ; i < total ; i++) {
			if (this.isIgnore('check', ds.getAt(i))) {
				continue;
			}
			val = ds.getAt(i).get(this.dataIndex);
			if ('gray' === val || !val) {
				isAllEnable = false;
				break;
			}
		}
		this.box_el.dom.checked = isAllEnable;
	},
	renderer: function(val, cellmeta, record) {
		return String.format('<div class="syno-grid-enable-column-{0}">&nbsp;</div>', ('gray' === val ? 'grayed' : val ? 'checked' : 'unchecked'));
	}
});
Ext.namespace('SYNO.LayoutConfig');

Ext.apply(SYNO.LayoutConfig, {
	FIXED_INDENT_WIDTH: 19,
	DEFAULT_FIELD_WIDTH: 250,
	DEFAULT_LABEL_WIDTH: 180
});

SYNO.LayoutConfig.calcLabelStyle = function(cfg) {
	var lc = SYNO.LayoutConfig;
	var indent = cfg.indent || 0;
	var indentWidth = indent * lc.FIXED_INDENT_WIDTH;
	var width = cfg.width || lc.DEFAULT_LABEL_WIDTH;

	var style = String.format('margin-left: {0}px; width: {1}px;', 
		indentWidth, width - indentWidth);

	return style;
};

SYNO.LayoutConfig.calcFieldStyle = function(cfg) {
	var lc = SYNO.LayoutConfig;
	var indent = cfg.indent || 0;
	var indentWidth = indent * lc.FIXED_INDENT_WIDTH;

	var style = String.format('margin-left: {0}px;', indentWidth);

	return style;
};

Ext.apply(SYNO.LayoutConfig, {
	fillWidth: function(config, item) {
		if (!item.width && config.synodefaults && config.synodefaults.width) {
			item.width = config.synodefaults.width;
		}
		return item;
	},

	fillHiddenNameId: function(config, item) {
		if (item.name) {
			item.hiddenName = item.name;
			item.hiddenId = Ext.id();
		}
		return item;
	},

	fillItemId: function(config, item) {
		if (item.name) {
			item.itemId = item.name;
		}
		return item;
	},

	fillTextMaxLen: function(config, item) {
		if (item.maxlength) {
			item.autoCreate = {tag: 'input', type: 'text', maxlength: item.maxlength};
		}
		return item;
	},

	fillPasswordMaxLen: function(config, item) {
		if (item.maxlength) {
			item.autoCreate = {tag: 'input', type: 'password', maxlength: item.maxlength};
		}
		return item;
	},

	fillLabelStyle: function(config, item) {
		item.labelStyle = SYNO.LayoutConfig.calcLabelStyle({
			width: item.labelWidth || config.labelWidth,
			indent: item.indent
		});
		return item;
	},

	fillFieldStyle: function(config, item) {
		item.style = SYNO.LayoutConfig.calcFieldStyle({
			indent: item.indent
		});
		return item;
	},

	fillPasswordConfirmValidator: function(config, item) {
		if (item.confirmFor && !item.validator) {
			item.validator = function(value) {
				if (!this.ownerCt) {
					return 'Failed to find ownerCt';
				}

				var passField = this.ownerCt.get(this.confirmFor);
				var pass = passField.getValue();

				if ((value !== pass) && (pass !== '12345678' || value !== '87654321')) {
					return _JSLIBSTR('vtype', 'password_confirm_failed');
				}
				return true;
			};
		}
		return item;
	}
});

Ext.ns('SYNO.LayoutConfig.Types');
Ext.ns('SYNO.LayoutConfig.Defaults');

// synotype: combo
SYNO.LayoutConfig.Defaults.combo = {
	xtype: 'combo',
	triggerAction: 'all',
	editable: false,
	mode: 'local'
};
SYNO.LayoutConfig.Types.combo = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.combo);

	SYNO.LayoutConfig.fillWidth(config, item);
	SYNO.LayoutConfig.fillHiddenNameId(config, item);
	SYNO.LayoutConfig.fillTextMaxLen(config, item);
	SYNO.LayoutConfig.fillLabelStyle(config, item);
	return item;
};

// synotype: desc
SYNO.LayoutConfig.Defaults.desc = {
	xtype: 'displayfield',
	hideLabel: true
};
SYNO.LayoutConfig.Types.desc = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.desc);

	SYNO.LayoutConfig.fillFieldStyle(config, item);
	return item;
};

// synotype: check
SYNO.LayoutConfig.Defaults.check = {
	xtype: 'checkbox',
	hideLabel: true
};
SYNO.LayoutConfig.Types.check = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.check);

	SYNO.LayoutConfig.fillFieldStyle(config, item);
	return item;
};

// synotype: radio
SYNO.LayoutConfig.Defaults.radio = {
	xtype: 'radio',
	hideLabel: true
};
SYNO.LayoutConfig.Types.radio = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.radio);

	SYNO.LayoutConfig.fillFieldStyle(config, item);
	return item;
};

// synotype: text
SYNO.LayoutConfig.Defaults.text = {
	xtype: 'textfield',
	msgTarget: 'qtip',
	validateOnBlur: true,
	validationEvent: 'blur'
};
SYNO.LayoutConfig.Types.text = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.text);

	SYNO.LayoutConfig.fillWidth(config, item);
	SYNO.LayoutConfig.fillTextMaxLen(config, item);
	SYNO.LayoutConfig.fillLabelStyle(config, item);
	return item;
};

// synotype: password
SYNO.LayoutConfig.Defaults.password = {
	xtype: 'textfield',
	inputType: 'password',
	msgTarget: 'qtip',
	validateOnBlur: true,
	validationEvent: 'blur'
};
SYNO.LayoutConfig.Types.password = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.password);

	SYNO.LayoutConfig.fillWidth(config, item);
	SYNO.LayoutConfig.fillItemId(config, item);
	SYNO.LayoutConfig.fillPasswordMaxLen(config, item);
	SYNO.LayoutConfig.fillLabelStyle(config, item);
	return item;
};

// synotype: password_confirm
SYNO.LayoutConfig.Defaults.password_confirm = {
	xtype: 'textfield',
	inputType: 'password',
	msgTarget: 'qtip',
	validateOnBlur: true,
	validationEvent: 'blur'
};
SYNO.LayoutConfig.Types.password_confirm = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.password_confirm);

	SYNO.LayoutConfig.fillWidth(config, item);
	SYNO.LayoutConfig.fillItemId(config, item);
	SYNO.LayoutConfig.fillPasswordMaxLen(config, item);
	SYNO.LayoutConfig.fillLabelStyle(config, item);
	SYNO.LayoutConfig.fillPasswordConfirmValidator(config, item);
	return item;
};

// synotype: number
SYNO.LayoutConfig.Defaults.number = {
	xtype: 'numberfield',
	msgTarget: 'qtip',
	validateOnBlur: true,
	validationEvent: 'blur',
	allowDecimals: false,
	allowNegative: false,
	allowBlank: false
};
SYNO.LayoutConfig.Types.number = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.number);

	SYNO.LayoutConfig.fillWidth(config, item);
	SYNO.LayoutConfig.fillTextMaxLen(config, item);
	SYNO.LayoutConfig.fillLabelStyle(config, item);
	return item;
};

// synotype: indent
SYNO.LayoutConfig.Defaults.indent = {
};
SYNO.LayoutConfig.Types.indent = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.indent);

	SYNO.LayoutConfig.fillWidth(config, item);
	SYNO.LayoutConfig.fillLabelStyle(config, item);
	return item;
};

// synotype: indent_no_label
SYNO.LayoutConfig.Defaults.indent_no_label = {
	hideLabel: true
};
SYNO.LayoutConfig.Types.indent_no_label = function(config, item) {
	Ext.applyIf(item, SYNO.LayoutConfig.Defaults.indent_no_label);

	SYNO.LayoutConfig.fillWidth(config, item);
	SYNO.LayoutConfig.fillFieldStyle(config, item);
	return item;
};

SYNO.LayoutConfig.fill = function(cfg) {
	var me = SYNO.LayoutConfig;

	return me.fillForm(cfg);
};

SYNO.LayoutConfig.fillFormField = function(cfg, item) {
	if (!item) {
		return arguments.callee({}, cfg);
	}

	var synotype = item.synotype;
	Ext.each(item.items || [], function(subItem, index, length) {
		SYNO.LayoutConfig.fillFormField(item, subItem);
	});
	if (synotype && SYNO.LayoutConfig.Types[synotype]) {
		SYNO.LayoutConfig.Types[synotype](cfg, item);
		
	}
	return item;
};


SYNO.LayoutConfig.fillForm = function(cfg) {
	return SYNO.LayoutConfig.fillFormField(cfg);
};

Ext.ns('SYNO.SDS');

SYNO.SDS.PagelessGridView = (function(){

	var superclass = undefined;
	var extendClass = Ext.ux.grid.BufferView;
	var cls = Ext.extend(extendClass, {
		position: 0,
		scrollBuffer: 200,
		init : function(grid) {
			superclass.init.apply(this, arguments);
			this.ds.on({
				guaranteedrange: this.onGuaranteedRange,
				loadByIndex: this.onLoadByIndex,
				scope: this
			});
			this.needRefresh = true;
		},
		onLoadByIndex: function(store, start){
			var me = this,
				rh = me.getCalculatedRowHeight();
			start = start || 0;
			var opt = Ext.isIE && !Ext.isIE9 ? false : {
				duration: 0.35*start/store.getTotalCount()
			};
			me.scroller.scrollTo('top', rh*start, opt);
		},
		afterRenderUI: function() {
			superclass.afterRenderUI.apply(this, arguments);
			this.scroller.un('scroll', Ext.ux.grid.BufferView.syncScroll,  Ext.ux.grid.BufferView);
			this.scroller.on('scroll', this.syncScroll,  this, {buffer: this.scrollBuffer || 0});
		},
		onGuaranteedRange: function(range, start, end) {
			var me = this,
				ds = me.ds,
				vr = me.getVisibleRows();
	
			// this should never happen
			if (range.length &&  vr.first < range[0].index) {
				return;
			}
	
			ds.guaranteeLoadRecords(range);
			me.update();
		},
		// private
		getParams : function(){
			//retain backwards compat, allow params on the toolbar itself, if they exist.
			return this.paramNames || this.grid.store.paramNames;
		},
		getRowCount: function(){
			var me = this,
				store = me.ds;
			return store[(!store.remoteFilter && store.isFiltered()) ? 'getCount' : 'getTotalCount']() || 0; 
		},
		getScrollHeight: function() {
			var me = this,
				rh = me.getCalculatedRowHeight(),
				rowCount = me.getRowCount();
			return rowCount * rh;
		},
		getVisibleRows: function(){
			var count = this.getVisibleRowCount(),
				sc = this.scroller.dom.scrollTop,
				start = (sc === 0 ? 0 : Math.floor(sc/this.getCalculatedRowHeight())-1);
			return {
				first: Math.max(start, 0),
				last: Math.min(start + count + 1, this.ds.getTotalCount()-1)
			};
		},
		// don't do refresh
		onLoad : function(store, recs, options) {
			this.update();
		},
		doRender : function(cs, rs, ds, startRow, colCount, stripe, onlyBody){
			var ts = this.templates, 
				ct = ts.cell, 
				rt = ts.row, 
				rb = ts.rowBody, 
				last = colCount-1,
				rh = this.getStyleRowHeight(),
				vr = this.getVisibleRows(),
				tstyle = 'width:'+this.getTotalWidth()+';height:'+rh+'px;',
				// buffers
				buf = [], 
				cb, 
				c, 
				p = {}, 
				rp = {tstyle: tstyle}, 
				r;
			for (var j = 0, len = rs.length; j < len; j++) {
				r = rs[j]; cb = [];
				var rowIndex = (j+startRow),
					visible = /*(rowIndex >= vr.first && rowIndex <= vr.last) &&*/ r.hasRec !== false;
				if (visible) {
					for (var i = 0; i < colCount; i++) {
						c = cs[i];
						p.id = c.id;
						p.css = i === 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
						p.attr = p.cellAttr = "";
						p.value = c.renderer(r.data[c.name], p, r, rowIndex, i, ds);
						p.style = c.style;
						if (p.value === undefined || p.value === "") {
							p.value = "&#160;";
						}
						if (r.dirty && typeof r.modified[c.name] !== 'undefined') {
							p.css += ' x-grid3-dirty-cell';
						}
						cb[cb.length] = ct.apply(p);
					}
				}
				var alt = [];
				if(stripe && ((rowIndex+1) % 2 === 0)){
					alt[0] = "x-grid3-row-alt";
				}
				if(r.dirty){
					alt[1] = " x-grid3-dirty-row";
				}
				rp.cols = colCount;
				if(this.getRowClass){
					alt[2] = this.getRowClass(r, rowIndex, rp, ds);
				}
				rp.alt = alt.join(" ");
				rp.cells = cb.join("");
				buf[buf.length] =  !visible ? ts.rowHolder.apply(rp) : (onlyBody ? rb.apply(rp) : rt.apply(rp));
			}
			return buf.join("");
		},
		renderRows : function(startRow, endRow) {
			var me = this,
				grid     = me.grid,
				store    = grid.store,
				stripe   = grid.stripeRows,
				colModel = grid.colModel,
				colCount = colModel.getColumnCount(),
				rowCount = me.getRowCount(),
				records = [],
				realRecords,
				rec,
				vr = me.getVisibleRows();
			
			if (rowCount < 1 || store.getCount() < 1) {
				return '';
			}
			
			startRow = startRow || 0;
			endRow   = Ext.isDefined(endRow) ? endRow : store.getCount() - 1;
	
			for(var i = 0; i< rowCount; i++) {
				if((i >= vr.firs && i <= vr.last) && me.ds.getAt(i)) {
					records.push(me.ds.getAt(i));
				} else {
					rec = new store.recordType();
					rec.hasRec = false;
					records.push(rec);
				}
			}
			return this.doRender(this.getColumnData(), records, store, 0, colCount, stripe);
		},
		onDataChange : function(store, records){
			var me = this,
				vr = me.getVisibleRows();
			if(me.needRefresh) {
				me.refresh(true);
			}
			me.updateHeaderSortState();
			if(!me.ds.rangeSatisfied(vr.first, vr.last)) {
				me.doUpdateScroll();
			}
			me.needRefresh = true;
		},
		doUpdateScroll: function(){
			var me = this,
				rh = me.getCalculatedRowHeight(), 
				start = me.ds.guaranteedStart || 0,
				postion = rh*start;
			me.scroller.un('scroll', me.syncScroll, me);
			me.scroller.scrollTo('top', postion);
			me.scroller.on('scroll', me.syncScroll,  me, {buffer: me.scrollBuffer || 0});
		},
		attemptLoad: function(start, limit) {
			var me = this;
			if (!me.loadTask) {
				me.loadTask = new Ext.util.DelayedTask(me.doAttemptLoad, me, []);
			}
			me.loadTask.delay(me.scrollBuffer, me.doAttemptLoad, me, [start, limit]);
		},
		cancelLoad: function() {
			if (this.loadTask) {
				this.loadTask.cancel();
			}
		},
		doAttemptLoad: function(start, end) {
			var me = this;
			me.ds.mask();
			me.ds.guaranteeRange(start, end);
		},
		doUpdate: function(){
			var me = this;
			if (this.getVisibleRowCount() > 0) {
				var g = me.grid, 
					cm = g.colModel, 
					ds = g.store,
					cs = me.getColumnData(),
					vr = me.getVisibleRows(),
					data,
					row;
				for (var i = vr.first; i <= vr.last; i++) {
					// if row is NOT rendered and is visible, render it
					if(!me.isRowRendered(i) &&(row = me.getRow(i))){
						data = me.ds.getAt(i);
						if(data) {
							var html = me.doRender(cs, [data], ds, i, cm.getColumnCount(), g.stripeRows, true);
							row.innerHTML = html;
						}
					}
				}
				this.clean();
			}
		},
		doClean: function(){
			if (this.getVisibleRowCount() > 0) {
				var me = this,
					vr = me.getVisibleRows();
				if(vr.first < me.cacheSize) {
					vr.first = 0;
				} else {
					vr.first -= me.cacheSize;
				}
	
				vr.last += me.cacheSize;
	
				var i = 0, rows = me.getRows();
	
				for(var len = me.getRowCount(); i < len; i++){
					// if current row is outside of first and last and
					// has content, update the innerHTML to nothing
					if ((i < vr.first || i > vr.last) && rows[i]) {
						rows[i].innerHTML = '';
					}
				}
			}
		},
		onViewScroll: function(e){
			var me = this,
				lastPosition = me.position;
			me.position = me.scroller.dom.scrollTop;
			me.lastScrollDirection = me.position > lastPosition ? 1 : -1;
			// Check the position so we ignore horizontal scrolling
			if (lastPosition !== me.position) {
				me.handleViewScroll(e, me.lastScrollDirection);
			}
		},
		handleViewScroll: function(e, direction){
			var me                = this,
				store             = me.ds,
				view              = me,
				guaranteedStart   = store.guaranteedStart,
				guaranteedEnd     = store.guaranteedEnd,
				renderedSize      = store.getCount(),
				totalCount        = store.getTotalCount(),
				highestStartPoint = totalCount - renderedSize,
				vr = me.getVisibleRows(),
				visibleStart      = vr.first,
				visibleEnd        = vr.last,
				requestStart,
				requestEnd;
	
			// Only process if the total rows is larger than the visible page size
			if (totalCount >= renderedSize) {
	
				// This is only set if we are using variable row height, and the thumb is dragged so that
				// There are no remaining visible rows to vertically anchor the new table to.
				// In this case we use the scrollProprtion to anchor the table to the correct relative
				// position on the vertical axis.
				me.scrollProportion = undefined;
	
				// We're scrolling up
				if (direction == -1) {
					if (visibleStart !== undefined) {
						if (visibleStart < (guaranteedStart + me.numFromEdge)) {
							requestStart = Math.max(0, visibleEnd + store.numFromEdge - store.pageSize);
						} else{
							requestStart = visibleStart;
						}
					}
				}
				// We're scrolling down
				else {
					if (visibleStart !== undefined) {
						if (visibleEnd > (guaranteedEnd - store.numFromEdge)) {
							requestStart = visibleStart - store.numFromEdge;
						} else{
							requestStart = visibleStart - store.numFromEdge;
						}
					}
				}
				
	
				// We scrolled close to the edge and the Store needs reloading
				if (requestStart !== undefined) {
					requestEnd = visibleEnd + store.numFromEdge;
					// If range is satsfied within the prefetch buffer, then just draw it from the prefetch buffer
					if (store.rangeSatisfied(requestStart, requestEnd)) {
						me.cancelLoad();
						me.needRefresh = false;
						store.guaranteeRange(requestStart, requestEnd);
					} else {
						me.needRefresh = true;
						me.attemptLoad(requestStart, requestEnd);
					}
				}
			}
		},
		syncScroll: function(e){
			extendClass.superclass.syncScroll.apply(this, arguments);
			this.onViewScroll(e);
		},
		onLayout : function(vw, vh) {
			var me = this,
				lastScrollBar = me.verticalScrollHeight;
			superclass.onLayout.apply(this, arguments);
			me.verticalScrollHeight = vh;
			//resize
			if(lastScrollBar < me.verticalScrollHeight) {
				me.tryLoadData();
			}
		},
		resolveCell : function(row, col, hscroll) {
			if (!Ext.isNumber(row)) {
				row = row.rowIndex;
			}
			
			if (!this.ds) {
				return null;
			}

			if (row < 0 || row >= this.ds.getTotalCount() || this.ds.getCount() === 0) {
				return null;
			}
	
			col = (col !== undefined ? col : 0);
	
			var rowEl    = this.getRow(row),
				colModel = this.cm,
				colCount = colModel.getColumnCount(),
				cellEl;
				
			if (!(hscroll === false && col === 0)) {
				while (col < colCount && colModel.isHidden(col)) {
					col++;
				}
				
				cellEl = this.getCell(row, col);
			}
	
			return {row: rowEl, cell: cellEl};
		},
		tryLoadData: function(){
			var me                = this,
				store             = me.ds,
				vr = me.getVisibleRows(),
				visibleStart      = vr.first,
				visibleEnd        = vr.last;
			if(visibleEnd <= visibleStart) {
				return;
			}
			if (store.rangeSatisfied(visibleStart, visibleEnd)) {
				me.cancelLoad();
				me.needRefresh = false;
				store.guaranteeRange(visibleStart - store.numFromEdge, visibleEnd + store.numFromEdge);
			} else {
				me.needRefresh = true;
				me.attemptLoad(visibleStart - store.numFromEdge, visibleEnd + store.numFromEdge);
			}
		}
	});
	//private
	superclass = cls.superclass;
	return cls;
})();

Ext.ns('SYNO.SDS');

SYNO.SDS.PagingToolbar = Ext.extend(Ext.Toolbar, {
	displayMsg: _JSLIBSTR('uicommon', 'totalDataLength'),
	firstText: _JSLIBSTR('extlang', 'firstpage'),
    prevText: _JSLIBSTR('extlang', 'prevpage'),
    nextText: _JSLIBSTR('extlang', 'nextpage'),
    lastText: _JSLIBSTR('extlang', 'lastpage'),
    refreshText: _JSLIBSTR('extlang', 'refresh'),
    emptyMsg: _JSLIBSTR('extlang', 'pagenodata'),
	initComponent : function(){
        var T = Ext.Toolbar, pagingItems = [this.first = new T.Button({
            tooltip: this.firstText,
            overflowText: this.firstText,
            iconCls: 'x-tbar-page-first',
            disabled: true,
            handler: this.moveFirst,
            scope: this
        }), this.prev = new T.Button({
            tooltip: this.prevText,
            overflowText: this.prevText,
            iconCls: 'x-tbar-page-prev',
            disabled: true,
            hidden: true,
            handler: this.movePrevious,
            scope: this
        }), '-', this.next = new T.Button({
            tooltip: this.nextText,
            overflowText: this.nextText,
            iconCls: 'x-tbar-page-next',
            disabled: true,
            hidden: true,
            handler: this.moveNext,
            scope: this
        }), this.last = new T.Button({
            tooltip: this.lastText,
            overflowText: this.lastText,
            iconCls: 'x-tbar-page-last',
            disabled: true,
            handler: this.moveLast,
            scope: this
        }), '-', this.refresh = new T.Button({
            tooltip: this.refreshText,
            overflowText: this.refreshText,
            iconCls: 'x-tbar-loading',
            handler: this.doRefresh,
            scope: this
        })];
		var userItems = this.items || this.buttons || [];
		if (this.prependButtons) {
			this.items = userItems.concat(pagingItems);
		}else{
			this.items = pagingItems.concat(userItems);
		}
        delete this.buttons;
        if(this.displayInfo){
            this.items.push('->');
            this.items.push(this.displayItem = new Ext.Toolbar.TextItem({}));
        }
        SYNO.SDS.PagingToolbar.superclass.initComponent.call(this);
		this.addEvents(
            'change',
            'beforechange'
        );
        //this.on('afterlayout', this.onFirstLayout, this, {single: true});

        this.bindStore(this.store, true);
    },

    // private
    /*onFirstLayout : function(){
        if(this.dsLoaded){
            this.onLoad.apply(this, this.dsLoaded);
        }
    },*/

    // private
    updateInfo : function(){
        if(this.displayItem){
            var count = this.store.getCount();
            var msg = 
                String.format(
                    this.displayMsg,
                    this.store.getTotalCount()
                );
            this.displayItem.setText(msg);
        }
    },

    // private
    onLoad : function(store, r, o){
        if(!this.rendered){
            this.dsLoaded = [store, r, o];
            return;
        }
        var p = this.getParams(),
            enable = this.store.getTotalCount() > 0;
		if(o) {
			this.cursor = (o.params && o.params[p.start]) ? o.params[p.start] : 0;
		}
        //var d = this.getPageData(), ap = d.activePage, ps = d.pages;

        //this.afterTextItem.setText(String.format(this.afterPageText, d.pages));
        //this.inputItem.setValue(ap);
        this.first.setDisabled(!enable);
        this.prev.setDisabled(!enable);
        this.next.setDisabled(!enable);
        this.last.setDisabled(!enable);
        this.refresh.enable();
        this.updateInfo();
        this.fireEvent('change', this);
    },

    // private
    getPageData : function(){
        var total = this.store.getTotalCount();
        return {
            total : total,
            activePage : Math.ceil((this.cursor+this.pageSize)/this.pageSize),
            pages :  total < this.pageSize ? 1 : Math.ceil(total/this.pageSize)
        };
    },

    /**
     * Change the active page
     * @param {Integer} page The page to display
     */
    /*changePage : function(page){
        this.doLoad(((page-1) * this.pageSize).constrain(0, this.store.getTotalCount()));
    },*/

    // private
    onLoadError : function(){
        if(!this.rendered){
            return;
        }
        this.refresh.enable();
    },

    // private
    /*readPage : function(d){
        var v = this.inputItem.getValue(), pageNum;
        if (!v || isNaN(pageNum = parseInt(v, 10))) {
            this.inputItem.setValue(d.activePage);
            return false;
        }
        return pageNum;
    },

    onPagingFocus : function(){
        this.inputItem.select();
    },

    //private
    onPagingBlur : function(e){
        this.inputItem.setValue(this.getPageData().activePage);
    },

    // private
    onPagingKeyDown : function(field, e){
        var k = e.getKey(), d = this.getPageData(), pageNum;
        if (k == e.RETURN) {
            e.stopEvent();
            pageNum = this.readPage(d);
            if(pageNum !== false){
                pageNum = Math.min(Math.max(1, pageNum), d.pages) - 1;
                this.doLoad(pageNum * this.pageSize);
            }
        }else if (k == e.HOME || k == e.END){
            e.stopEvent();
            pageNum = k == e.HOME ? 1 : d.pages;
            field.setValue(pageNum);
        }else if (k == e.UP || k == e.PAGEUP || k == e.DOWN || k == e.PAGEDOWN){
            e.stopEvent();
            if((pageNum = this.readPage(d))){
                var increment = e.shiftKey ? 10 : 1;
                if(k == e.DOWN || k == e.PAGEDOWN){
                    increment *= -1;
                }
                pageNum += increment;
                if(pageNum >= 1 & pageNum <= d.pages){
                    field.setValue(pageNum);
                }
            }
        }
    },*/

    // private
    getParams : function(){
        //retain backwards compat, allow params on the toolbar itself, if they exist.
        return this.paramNames || this.store.paramNames;
    },

    // private
    beforeLoad : function(){
        if(this.rendered && this.refresh){
            this.refresh.disable();
        }
    },

    // private
    doLoad : function(start, limit){
        var me = this, o = {}, pn = this.getParams(), store = me.store,
		pageSize = me.pageSize || store.pageSize;
        limit = Math.max(limit ,pageSize);
        o[pn.start] = start;
        o[pn.limit] = limit;


        if(me.fireEvent('beforechange', me, o) !== false){
			if(store.buffered) {
                store.mask();
				store.prefetch({
					start: start,
					limit: limit,
					params:o,
					callback: function() {
						store.guaranteeRange(start, start + limit -1);
					}
				});
			} else{
				store.load({params:o});
			}
        }
    },

    /**
     * Move to the first page, has the same effect as clicking the 'first' button.
     */
    moveFirst : function(){
        this.store.loadByIndex(0);
    },

    /**
     * Move to the previous page, has the same effect as clicking the 'previous' button.
     */
    movePrevious : function(){
        var start = this.store.guaranteedStart || 0,
            pageSize = this.pageSize || this.store.pageSize;
        this.store.loadByIndex((start/pageSize - 1) * pageSize);
    },

    /**
     * Move to the next page, has the same effect as clicking the 'next' button.
     */
    moveNext : function(){
        var start = this.store.guaranteedStart || 0,
            pageSize = this.pageSize || this.store.pageSize;
        this.store.loadByIndex((start/pageSize+1) * pageSize);
    },

    /**
     * Move to the last page, has the same effect as clicking the 'last' button.
     */
    moveLast : function(){
        this.store.loadByIndex(this.store.getTotalCount());
    },

    /**
     * Refresh the current page, has the same effect as clicking the 'refresh' button.
     */
    doRefresh : function(){
		 var me = this,
			 store = me.store,
			 start = store.guaranteedStart || this.cursor || 0;
		 if(store.getTotalCount()< start) {
			 start = store.getTotalCount() - (store.pageSize || this.pageSize);
		 }
		 this.doLoad(start, store.guaranteedEnd - store.guaranteedStart + 1);
    },

    /**
     * Binds the paging toolbar to the specified {@link Ext.data.Store}
     * @param {Store} store The store to bind to this toolbar
     * @param {Boolean} initial (Optional) true to not remove listeners
     */
    bindStore : function(store, initial){
        var doLoad;
        if(!initial && this.store){
            if(store !== this.store && this.store.autoDestroy){
                this.store.destroy();
            }else{
                this.store.un('beforeload', this.beforeLoad, this);
                this.store.un('load', this.onLoad, this);
                this.store.un('exception', this.onLoadError, this);
            }
            if(!store){
                this.store = null;
            }
        }
        if(store){
            store = Ext.StoreMgr.lookup(store);
            store.on({
                scope: this,
                beforeload: this.beforeLoad,
                load: this.onLoad,
                exception: this.onLoadError
            });
            doLoad = true;
        }
        this.store = store;
        if(doLoad){
            this.onLoad(store, null, {});
        }
    },

    /**
     * Unbinds the paging toolbar from the specified {@link Ext.data.Store} <b>(deprecated)</b>
     * @param {Ext.data.Store} store The data store to unbind
     */
    unbind : function(store){
        this.bindStore(null);
    },

    /**
     * Binds the paging toolbar to the specified {@link Ext.data.Store} <b>(deprecated)</b>
     * @param {Ext.data.Store} store The data store to bind
     */
    bind : function(store){
        this.bindStore(store);
    },

    // private
    onDestroy : function(){
        this.bindStore(null);
        SYNO.SDS.PagingToolbar.superclass.onDestroy.call(this);
    }
});

Ext.reg('synopaging', SYNO.SDS.PagingToolbar);

Ext.ns('SYNO.SDS');

SYNO.SDS.RowSelectionModel = Ext.extend(Ext.grid.RowSelectionModel,{
    init : function(grid){
        SYNO.SDS.RowSelectionModel.superclass.init.apply(this, arguments);
        var me = this,
            ds = me.grid.store;
        if(ds.buffered) {
            me.selected = {};
            me.innerSelections = [];
            me.buffered = true;
        }
    },
    onRefresh : function(){
        var ds = this.grid.store,
            s = this.selections,
            i = 0,
            len = s.length, 
            index, r;
            
        this.silent = true;
        if(!this.buffered) {
            this.clearSelections(true);
            for(; i < len; i++){
                r = s[i];
                if((index = ds.indexOfId(r.id)) != -1){
                    this.selectRow(index, true);
                }
            }
        } else{
           var newSel = [];
           for (i = ds.getCount() - 1; i >= 0; i--) {
               r = ds.getAt(i);
              if (r && this.selected[r.id]) {
                 newSel.push(r.index || i);
              }
           }
           this.selectRows(newSel, true);
        }
        if(s.length != this.selections.getCount()){
            this.fireEvent('selectionchange', this);
        }
        this.silent = false;
    },
    clearSelections : function(fast){
        SYNO.SDS.RowSelectionModel.superclass.clearSelections.apply(this, arguments);
        if(this.buffered) {
            this.selected = {};
            this.innerSelections = [];
        }
    },
    getSelections: function() {
       return [].concat(this.innerSelections);
    },
    selectAll: function() {
       if(this.isLocked()) {
           return;
       }
       if(!this.buffered) {
           SYNO.SDS.RowSelectionModel.superclass.selectAll.apply(this, arguments);
       } else{
           var ds = this.grid.store;
           ds.suspendEvents();
           ds.load({ 
              params: {start: 0, limit: ds.getTotalCount() },
              callback: function() {                             
                 this.innerSelections = ds.data.items.slice(0);
                 this.selections.clear();
                 this.selected = {};
                 for (var i = this.innerSelections.length - 1; i >= 0; i--) {
                    this.selected[this.innerSelections[i].id] = true;
                 }
                 ds.resumeEvents();
                 this.onRefresh();
              },
              scope: this
           });
       }
    },
    selectRecords : function(records, keepExisting){
        if(!keepExisting){
            this.clearSelections();
        }
        var ds = this.grid.store,
            i = 0,
            len = records.length,
            r;
        for(; i < len; i++){
            r = records[i];
            if((index = ds.indexOfId(r.id)) != -1){
                this.selectRow(ds.getAt(index).index || index, true);
            }
        }
    },
    selectRow : function(index, keepExisting, preventViewNotify){
        var me = this;
        if(me.isLocked()){// || (keepExisting && me.isSelected(index))){
            return;
        }
        var r = this.grid.store.getAt(index);
        if(r && this.fireEvent('beforerowselect', this, index, keepExisting, r) !== false){
            if(!keepExisting || this.singleSelect){
                this.clearSelections();
            }
            this.selections.add(r);
            if (me.buffered && !this.selected[r.id]) 
            {
                this.innerSelections.push(r);
                this.selected[r.id] = true;
            }
            this.last = this.lastActive = index;
            if(!preventViewNotify){
                this.grid.getView().onRowSelect(index);
            }
            if(!this.silent){
                this.fireEvent('rowselect', this, index, r);
                this.fireEvent('selectionchange', this);
            }
        }
    },
    selectRecord : function(record, keepExisting, preventViewNotify){
        var me = this, index = record.index;
        if(me.isLocked() || !index){// || (keepExisting && me.isSelected(index))){
            return;
        }

        if(record && this.fireEvent('beforerowselect', this, index, keepExisting, record) !== false){
            if(!keepExisting || this.singleSelect){
                this.clearSelections();
            }
            this.selections.add(record);
            if (me.buffered && !this.selected[record.id]) 
            {
                this.innerSelections.push(record);
                this.selected[record.id] = true;
            }
            if(!preventViewNotify){
                this.grid.getView().onRowSelect(index);
            }
            if(!this.silent){
                this.fireEvent('rowselect', this, index, record);
                this.fireEvent('selectionchange', this);
            }
        }
    },
    remoteSelectRange: function(startRow, endRow, keepExisting) {
       if(this.isLocked()) {
           return;
       }
       if(this.buffered) {
           var ds = this.grid.store,
               temp;
           if(startRow > endRow) {
               temp = endRow;
               endRow = startRow;
               startRow = temp;
           }

           if(ds.rangeSatisfied(startRow, endRow)) {
               this.selectRange(startRow, endRow, keepExisting);
               return;
           }
           startRow = Math.max(0, startRow);
           endRow = Math.min(endRow, ds.getTotalCount() - 1);
           ds.suspendEvents();
           ds.prefetch({ 
                start: startRow,
                limit: endRow - startRow + 1,
                callback: function(r) {
                    var data = ds.prefetchData.items;
                    if(!keepExisting){
                        this.clearSelections();
                    }
                    for (var i = data.length - 1; i >= 0; i--) {
                        this.selectRecord(data[i], true);
                    }
                    ds.resumeEvents();
                },
              scope: this
           });
       } else {
           this.selectRange(startRow, endRow, keepExisting);
       }
    },
    // private
    handleMouseDown : function(g, rowIndex, e){
        if(e.button !== 0 || this.isLocked()){
            return;
        }
        var view = this.grid.getView();
        if(e.shiftKey && !this.singleSelect && this.last !== false){
            var last = this.last;
            this.remoteSelectRange(last, rowIndex, e.ctrlKey);
            this.last = last; // reset the last
            view.focusRow(rowIndex);
        }else{
            var isSelected = this.isSelected(rowIndex);
            if(e.ctrlKey && isSelected){
                this.deselectRow(rowIndex);
            }else if(!isSelected || this.getCount() > 1){
                this.selectRow(rowIndex, e.ctrlKey || e.shiftKey);
                view.focusRow(rowIndex);
            }
        }
    },
    hasNext : function(){
        return this.last !== false && (this.last+1) < this.grid.store.getTotalCount();
    },
    deselectRow : function(index, preventViewNotify){
        if(this.isLocked()){
            return;
        }
        if(this.last == index){
            this.last = false;
        }
        if(this.lastActive == index){
            this.lastActive = false;
        }
        var r = this.grid.store.getAt(index);
        if(r){
            this.selections.remove(r);
            if(this.buffered) {
                for (var i = this.innerSelections.length - 1; i >= 0; i--) {
                    if (this.innerSelections[i].id == r.id) {
                       this.innerSelections.splice(i, 1);
                       this.selected[r.id] = false;
                       delete this.selected[r.id];
                       break;
                    }
                }
            }
            if(!preventViewNotify){
                this.grid.getView().onRowDeselect(index);
            }
            this.fireEvent('rowdeselect', this, index, r);
            this.fireEvent('selectionchange', this);
        }
    }
});
Ext.ns('SYNO.SDS');

SYNO.SDS.Store = Ext.extend(Ext.data.Store, {
	prefetchData: null,
	pageSize: 25,
	numFromEdge: 15,
	defaultPageSize: 25,
	purgePageCount: 2,
	buffered: false,
	constructor: function(config){
		var me = this,
			recordIndexFn = function(record) {
				 return record.index;
			};
		SYNO.SDS.Store.superclass.constructor.apply(me, arguments);
        Ext.apply(me, config);
        if (config.buffered || me.buffered) {
            me.prefetchData = new Ext.util.MixedCollection(false, recordIndexFn);
            me.pendingRequests = [];
            me.pagesRequested = [];

            me.sortOnLoad = false;
            me.filterOnLoad = false;

            this.addEvents('beforeprefetch', 'guaranteedrange', 'totalcountchange', 'loadByIndex');
        }
	},
    loadByIndex: function(start){
        this.fireEvent('loadByIndex', this, start);
    },
	getRequestId: function() {
        this.requestSeed = this.requestSeed || 1;
        return this.requestSeed++;
    },
    //indexOfId: function(id) {
        //var rec = this.data.key(id);
        //return rec ? rec.index : null;
    //},
    getAt: function(index) {
        var i = 0,
            rec;
        for (;i<this.data.items.length;i++) {
            rec = this.data.items[i];
            if(rec.index === index) {
                return rec;
            }
        }
        return this.data.itemAt(index);
    },
    indexOfId : function(id){
        return this.data.key(id) ? this.data.key(id).index || this.data.indexOfKey(id): this.data.indexOfKey(id);
    },
    indexOf : function(record){
        return this.prefetchData.indexOf(record) !== -1 ? record.index : this.data.indexOf(record);
    },
    removeAllBuffer : function(silent){
        this.prefetchData.clear();
    },
    doSort: function() {
        var me = this,
            count;
        if (me.remoteSort) {

            // For a buffered Store, we have to clear the prefetch cache since it is keyed by the index within the dataset.
            // Then we must prefetch the new page 1, and when that arrives, reload the visible part of the Store
            if (me.buffered) {
                count = me.getCount();
                me.prefetchData.clear();
                me.prefetch({
                    start: 0,
                    limit: me.pageSize,
                    callback: function(records, operation, success) {
                        if (success) {
                            me.guaranteedStart = 0;
                            me.guaranteedEnd = records.length - 1;
                            me.guaranteeLoadRecords(records.slice(0, count));
                            //me.loadByIndex(0);
                        }
                    }
                });
            } else {
                //the load function will pick up the new sorters and request the sorted data from the proxy
                me.load();
            }
        } else {
            me.applySort();
        }
    },
    singleSort: function(fieldName, dir) {
        var me = this,
            prefetchData = me.prefetchData,
            sorters,
            start,
            end,
            range;
        var field = me.fields.get(fieldName);
        if (!field) {
            return false;
        }

        var name       = field.name,
            sortInfo   = me.sortInfo || null,
            sortToggle = me.sortToggle ? me.sortToggle[name] : null;

        if (!dir) {
            if (sortInfo && sortInfo.field == name) { // toggle sort dir
                dir = (me.sortToggle[name] || 'ASC').toggle('ASC', 'DESC');
            } else {
                dir = field.sortDir;
            }
        }

        me.sortToggle[name] = dir;
        me.sortInfo = {field: name, direction: dir};
        me.hasMultiSort = false;
        if (me.buffered) {
            if (me.remoteSort) {
                me.prefetchData.clear();
                me.doSort();
            } else {
                sorters = me.getSorters();
                start = me.guaranteedStart;
                end = me.guaranteedEnd;

                if (sorters.length) {
                    prefetchData.sort(sorters);
                    range = prefetchData.getRange();
                    prefetchData.clear();
                    me.cacheRecords(range);
                    delete me.guaranteedStart;
                    delete me.guaranteedEnd;
                    me.guaranteeRange(start, end);
                }
            }
        } else {
            me.doSort();
        }
        return true;
    },
	prefetch: function(options) {
		var me = this,
			requestId = me.getRequestId();

		me.pendingRequests.push(requestId);
		options = Ext.apply({}, options);
        this.storeOptions(options);
        if(me.sortInfo && me.remoteSort){
            var pn = me.paramNames;
            options.params = Ext.apply({}, options.params);
            options.params[pn.sort] = me.sortInfo.field;
            options.params[pn.dir] = me.sortInfo.direction;
			options.params[pn.start] = options.start;
            options.params[pn.limit] = options.limit;
			options.requestId = requestId;
        }
        try {
            if (this.fireEvent('beforeprefetch', this, options) !== false) {
                //me.loading = true;
                return this.executePrefetch('read', null, options); // <-- null represents rs.  No rs for load actions.
            }
            //return this.executePrefetch('read', null, options); // <-- null represents rs.  No rs for load actions.
        } catch(e) {
            me.handleException(e);
            return false;
        }
	},
	executePrefetch : function(action, rs, options, /* private */ batch) {
        // blow up if action not Ext.data.CREATE, READ, UPDATE, DESTROY
        if (!Ext.data.Api.isAction(action)) {
            throw new Ext.data.Api.Error('execute', action);
        }
        // make sure options has a fresh, new params hash
        options = Ext.applyIf(options||{}, {
            params: {}
        });
        if(batch !== undefined){
            this.addToBatch(batch);
        }
        // have to separate before-events since load has a different signature than create,destroy and save events since load does not
        // include the rs (record resultset) parameter.  Capture return values from the beforeaction into doRequest flag.
        var doRequest = true;

        if (action === 'read') {
            //doRequest = this.fireEvent('beforeload', this, options);
            Ext.applyIf(options.params, this.baseParams);
        }
        
        if (doRequest !== false) {
            // Send request to proxy.
            if (this.writer && this.proxy.url && !this.proxy.restful && !Ext.data.Api.hasUniqueUrl(this.proxy, action)) {
                options.params.xaction = action;    // <-- really old, probaby unecessary.
            }
            // Note:  Up until this point we've been dealing with 'action' as a key from Ext.data.Api.actions.
            // We'll flip it now and send the value into DataProxy#request, since it's the value which maps to
            // the user's configured DataProxy#api
            // TODO Refactor all Proxies to accept an instance of Ext.data.Request (not yet defined) instead of this looooooong list
            // of params.  This method is an artifact from Ext2.
            this.proxy.request(Ext.data.Api.actions['read'], rs, options.params, this.reader, this.prefetchRecords, this, options);
        }
        return doRequest;
    },
	onGuaranteedRange: function() {
        var me = this,
            totalCount = me.getTotalCount(),
            start = me.requestStart,
            end = ((totalCount - 1) < me.requestEnd) ? totalCount - 1 : me.requestEnd,
            range = [],
            record,
            i = start;

        end = Math.max(0, end);

        //<debug>
        /*if (start > end) {
            Ext.log({
                level: 'warn',
                msg: 'Start (' + start + ') was greater than end (' + end +
                    ') for the range of records requested (' + me.requestStart + '-' +
                    me.requestEnd + ')' + (this.storeId ? ' from store "' + this.storeId + '"' : '')
            });
        }*/
        //</debug>

        //if (start !== me.guaranteedStart && end !== me.guaranteedEnd) {
        if (true) {
            me.guaranteedStart = start;
            me.guaranteedEnd = end;

            for (; i <= end; i++) {
                record = me.prefetchData.item(i);
                //<debug>
//                if (!record) {
//                    Ext.log('Record with key "' + i + '" was not found and store said it was guaranteed');
//                }
                //</debug>
                if (record) {
                    range.push(record);
                }
            }

            //me.innerLoadRecords(range, {start: start});
            //me.data.clear();
            //me.data.addAll(range);
            me.fireEvent('guaranteedrange', range, start, end);
            //if (me.cb) {
            //    me.cb.call(me.scope || me, range);
            //}
        }

        me.unmask();
    },
	// private
    // Called as a callback by the Reader during a prefetch operation.
    prefetchRecords : function(o, options, success){
        var i, len;

        if (this.isDestroyed === true) {
            return;
        }
        if(!o || success === false){
            if(success !== false){
                this.fireEvent('load', this, [], options);
            }
            if(options.callback){
                options.callback.call(options.scope || this, [], options, false, o);
            }
            return;
        }
        var r = o.records, t = o.totalRecords || r.length;

        if(!options || options.add !== true){
			this.cacheRecords(r, options);
			this.totalLength = t;
            this.fireEvent('totalcountchange', this.totalLength);
            /*if(this.pruneModifiedRecords){
                this.modified = [];
            }*/
            //for(i = 0, len = r.length; i < len; i++){
            //    r[i].join(this);
            //}
            //if(this.snapshot){
            //    this.data = this.snapshot;
            //    delete this.snapshot;
            //}
            //this.clearData();
            //this.data.addAll(r);
            //this.totalLength = t;
            //this.applySort();
            //this.fireEvent('datachanged', this);
        }/*else{
            var toAdd = [],
                rec,
                cnt = 0;
            for(i = 0, len = r.length; i < len; ++i){
                rec = r[i];
                if(this.indexOfId(rec.id) > -1){
                    this.doUpdate(rec);
                }else{
                    toAdd.push(rec);
                    ++cnt;
                }
            }
            this.totalLength = Math.max(t, this.data.length + cnt);
            this.add(toAdd);
        }*/
		this.pendingRequests.remove(options.requestId);
		this.fireEvent('load', this, r, options);
        if(options.callback){
            options.callback.call(options.scope || this, r, options, true);
        }
    },
	getPages: function(start, end){
        var me = this,
			startPage = me.getPageFromRecordIndex(start),
            endPage = me.getPageFromRecordIndex(end),
			pageSize = me.pageSize || me.defaultPageSize,
			first = Math.max(startPage-1, 0) * pageSize,
			last = Math.min(endPage * pageSize - 1, me.getTotalCount()) || 0;
		return {
			first: first,
			last: endPage !== 0 ?  last : first + pageSize - 1
		};
	},
	cacheRecords: function(records, operation) {
		var me = this,
			i = 0,
			length = records.length,
			start = operation ? operation.start : 0;

		if (!Ext.isDefined(me.totalLength)) {
			me.totalCount = records.length;
			//me.fireEvent('totalcountchange', me.totalCount);
		}

		// Tag all records with their index in the dataset so that the prefetch buffer can index them by their position in the dataset
		for (; i < length; i++) {
			records[i].index = start + i;
		}

		me.prefetchData.clear();
		me.prefetchData.addAll(records);

		/*for(i = 0, len = length; i < len; i++){
			records[i].join(me);
		}
		if(me.snapshot){
			me.data = me.snapshot;
			delete me.snapshot;
		}
		me.clearData();
		me.data.addAll(records);
		me.applySort();*/
		//me.fireEvent('datachanged', me);
		// If we are at the end of a load sequence, and we were suspending purge of prefetch, then 
		// Cancel the suspend of prefetch and return before purge can take place.
		// This is for when we prefetch multiple pages to cover a requested range.
		// It is possible that the first page could already be in the prefetch buffer, but then,
		// the addition of the second one could cause it to be purged. So purging is turned
		// off for multiple page requests.
		/*if (!me.hasPendingRequests() && me.suspendPurge) {
			me.suspendPurge = false;
			return;
		}

		if (me.purgePageCount && !me.suspendPurge) {
			me.purgeRecords();
		}*/

	},
    guaranteeLoadRecords : function(records, options){
        var me     = this,
            i      = 0,
            length = records.length,
            start = (options = options || {}).start,
            snapshot = me.snapshot;

        if (!options.addRecords) {
            delete me.snapshot;
            me.clearData(true);
        } else if (snapshot) {
            snapshot.addAll(records);
        }

        me.data.addAll(records);

        if (typeof start != 'undefined') {
            for (; i < length; i++) {
                records[i].index = start + i;
                records[i].join(me);
            }
        } else {
            for (; i < length; i++) {
                records[i].join(me);
            }
        }

        /*
         * this rather inelegant suspension and resumption of events is required because both the filter and sort functions
         * fire an additional datachanged event, which is not wanted. Ideally we would do this a different way. The first
         * datachanged event is fired by the call to this.add, above.
         */
        me.suspendEvents();

        if (me.filterOnLoad && !me.remoteFilter) {
            me.filter();
        }

        if (me.sortOnLoad && !me.remoteSort) {
            me.sort();
        }

        me.resumeEvents();
        me.fireEvent('datachanged', me, records);
        me.fireEvent('refresh', me);
    },
	guaranteeRange: function(start, end) {
        if(this.purgePageCount === 0){
			this.unmask();
			return;
		}
        end = (end > this.getTotalCount()) ? this.getTotalCount() - 1 : end;

        var me = this,
            startPage,
            endPage,
            page,
			totalCount = me.getTotalCount(),
			pages,
            lastRequestStart = me.requestStart;

        me.requestStart = start;
        me.requestEnd = end;
        // If data request can be satisfied from the prefetch buffer
        if (me.rangeSatisfied(start, end)) {

            // Attempt to keep the prefetch buffer primed with pages which encompass a live area of data.
            if (start < lastRequestStart) {
                end = Math.min(end + me.numFromEdge, totalCount - 1);
                start = Math.max(end - (me.pageSize - 1) - me.numFromEdge, 0);
            } else {
                start = Math.max(Math.min(start - me.numFromEdge, totalCount - me.pageSize), 0);
                end = Math.max(start + (me.pageSize - 1) + me.numFromEdge, end + me.numFromEdge) ;
            }
            
            // If the prefetch window calculated round the requested range is not already satisfied in the prefetch buffer,
            // then arrange to prefetch it.
            //if (!me.rangeSatisfied(start, end)) {
                //startPage = me.getPageFromRecordIndex(start);
                //endPage = me.getPageFromRecordIndex(end);
            //}
			
            me.onGuaranteedRange();
        }
        // Data needs loading from server
        else {
            
            // Calculate a prefetch range which is centered on the requested data
            //start = Math.min(Math.max(start - me.numFromEdge, 0), me.getTotalCount() - me.pageSize);
            //end = start + (me.pageSize - 1);

            //startPage = me.getPageFromRecordIndex(start);
            //endPage = me.getPageFromRecordIndex(end);
        }

        if (!me.rangeSatisfied(start, end)) {
            pages = me.getPages(start, end);
            var options = Ext.apply({}, me.lastOptions);

            options = Ext.apply(options, {
                start    : pages.first,
                limit    : pages.last - pages.first + 1,
                callback : me.onWaitForGuarantee,
                scope    : me
            });
            // Copy options into a new object so as not to mutate passed in objects
            /*var options = {
                //page     : page,
                start    : pages.first,
                limit    : pages.last - pages.first + 1,

                callback : me.onWaitForGuarantee,
                scope    : me
            };*/
            me.prefetch(options);
        }
        // We need to prime the cache with one or more pages.
        /*if (startPage !== undefined) {
            // Suspend purging of the prefetch cache during multiple page loads.
            me.suspendPurge = (endPage !== startPage);

            for (page = startPage; page <= endPage; page++) {
                me.prefetchPage(page);
            }
        }*/
    },
	 hasPendingRequests: function() {
        return this.pendingRequests.length;
    },
    // wait until all requests finish, until guaranteeing the range.
    onWaitForGuarantee: function(records, operation, success) {
        if (!this.hasPendingRequests()) {
            this.onGuaranteedRange();
        }
    },
	getPageFromRecordIndex: function(index) {
        return index < 0 ? 0 : Math.floor(index / this.pageSize) + 1;
    },
	rangeSatisfied: function(start, end) {
		if(this.purgePageCount === 0) {
            return true;
		}
        var me = this,
            i = Math.max(0, start),
            satisfied = true;
        end = Math.min(end, me.getTotalCount());
		if(start === end) {
			return Ext.isDefined(me.prefetchData.item(i));
		} else if(end < start){
			return false;
		}
        for (; i < end; i++) {
            if (!me.prefetchData.key(i)) {
                satisfied = false;
                break;
            }
        }
        return satisfied;
    },
	// hack to support loadmask
	mask: function(options) {
		this.masked = true;
		this.fireEvent('beforeload', this, options);
	},
	// hack to support loadmask
	unmask: function() {
		if (this.masked) {
			this.fireEvent('load', this);
		}
	}
});
Ext.namespace('SYNO');

/**
 * @author allenkao
 * @class SYNO.UI.TextFilter
 * @extends  Ext.form.TriggerField
 * This component can be attached with a data store and send query to remote to filter
 * the data in the store. Please note the textfilter shall be created before grid construction
 * if you are attaching the data store to grid.
 * <pre><code>
 		var findField = new SYNO.UI.TextFilter({
			emptyText: _T('user', 'search_user'),
			store: ds,
			pageSize: this.pagesize,
			queryAction: 'find',
			enumAction: 'enum',
			queryParam: 'query',
			queryDelay: 500,
			width: 150
		});
 </pre></code>
 @cfg {Ext.data.Store} store The data store to be filtered.
 @cfg {Number} pageSize The limit per query/enum action.
 @cfg {String} queryAction The parameter name sent when the action is to query specific value
 @cfg {String} enumAction The parameter name sent when the action is to enumerate all records without value
 @cfg {String} queryParam The parameter name sent to query specific string
 @cfg {Number} queryDelay The delay in ms for type and search
 */
SYNO.TextFilter = Ext.extend(Ext.form.TriggerField, {
	ctCls: 'syno-textfilter',
	cls: 'syno-textfilter-text',
	triggerConfig: {
		tag: 'div', cls: 'x-form-trigger syno-textfilter-trigger'
	},
	enableKeyEvents: true,
	listeners: {
		keyup: {
			fn: function(field, evt) {
				field.trigger.setVisible((field.getValue() !== ''));
			} 
		},
		render: {
			fn: function(field) {
				field.trigger.hide();
			}
		}
	},

	queryDelay: 500,
	queryAction: 'find',
	enumAction: 'enum',
	queryParam: 'query',
	localFilter: false,
	localFilterField: '',
	pageSize: 20,

	constructor: function(cfg) {
		SYNO.TextFilter.superclass.constructor.call(this, cfg);
		
		if (this.store && !this.localFilter) {
			this.mon(this.store, 'beforeload', this.onBeforeLoad, this);
		}
		if (this.store && this.localFilter === true) {
			this.mon(this.store, 'load', this.reset, this);
		}
	},

	initEvents: function() {
		SYNO.TextFilter.superclass.initEvents.call(this);

		this.mon(this.el, 'keyup', this.filter, this, {buffer: this.queryDelay});

		// shall this workaround also porting??

	},
	setPageSize: function(pageSize) {
		this.pageSize = pageSize;
	},
	onBeforeLoad: function(store, opts) {
		var val = this.getValue();

		if (val) {
			opts.params[this.queryParam] = val;
			opts.params.action = this.queryAction;
		} else {
			opts.params.action = this.enumAction;
		}
		return true;
	},
	filter: function() {
		var val = this.getValue();
		var ps;

		if (!this.store) {
			return;
		}

		if (this.localFilter === true) {
			if (val) {
				this.store.filter(this.localFilterField, val, true);
			} else {
				this.store.clearFilter(false);
			}
			return;
		}

		ps = {
			start: 0,
			limit: this.pageSize
		};
		if (val) {
			ps.action =  this.queryAction;
			ps[this.queryParam] = val;
			this.store.load({params: ps});
		} else {
			ps.action = this.enumAction;
			this.store.load({params: ps});
		}
	},
	reset: function() {
		SYNO.TextFilter.superclass.reset.call(this);
		if (this.localFilterField === false && this.store) {
			this.store.clearFilter(false);
			this.trigger.hide();
		}
	},
	onTriggerClick: function() {
		if (this.getValue()) {
			this.setValue('');
			this.trigger.hide();
			this.filter();
		}
	}
});

Ext.ns('SYNO');

SYNO.TriCheckbox = function(config) {
	SYNO.TriCheckbox.superclass.constructor.call(this, config);
};

Ext.extend(SYNO.TriCheckbox, Ext.form.Checkbox, {
	checkboxCls: 'x-checkbox',
	triMode: true,	
	values: [null, false, true],
	checkedCls: ['x-checkbox-grayed', null, 'x-checkbox-checked'],
	overClass: 'x-checkbox-over',
	clickClass: 'x-checkbox-down',
	defaultAutoCreate: {
		tag: 'input',
		type: 'hidden',
		autocomplete: 'off'
	},	
	onRender: function(ct, position) {
		Ext.form.Checkbox.superclass.onRender.call(this, ct, position);		
		if (this.inputValue !== undefined) {
			this.el.dom.value = this.inputValue;
		}
		this.wrap = this.el.wrap({
			cls: 'x-form-check-wrap'
		});
		if (this.boxLabel) {
			this.wrap.createChild({
				tag: 'label',
				htmlFor: this.el.id,
				cls: 'x-form-cb-label',
				html: this.boxLabel
			});
		}		
		if (this.clickClass && !this.disabled && !this.readOnly) {
			this.wrap.addClassOnClick(this.clickClass);
		}
		if (this.overClass && !this.disabled && !this.readOnly) {
			this.wrap.addClassOnOver(this.overClass);
		}
		this.checkbox = this.wrap.createChild({
            tag: 'img',
            src: Ext.BLANK_IMAGE_URL,
			cls: this.checkboxCls
        }, this.el);
				
		// Need to repaint for IE, otherwise positioning is broken
		if (Ext.isIE) {
			this.wrap.repaint();
		}
		this.resizeEl = this.positionEl = this.wrap;		
	},
	initValue : function(){
        if ((typeof this.value == "object" && this.value === null) || this.value === true) {
			this.setValue(this.value);
		} else {
			this.setValue(false);
		}        
        this.originalValue = this.getValue();
		if(this.overCls !== undefined) {
			this.overClass = this.overCls;
			delete this.overCls;
		}
    },
    onResize : function(){
		Ext.form.Checkbox.superclass.onResize.apply(this, arguments);
		if(!this.boxLabel && !this.fieldLabel && this.checkbox){
			this.checkbox.alignTo(this.wrap, 'c-c');
		}
	},
	afterRender: function(){
		Ext.form.Checkbox.superclass.afterRender.call(this);
	},	
	getCheckIndex: function() {		
		for (var i = 0; i < this.values.length; i++) {
			if (this.value === this.values[i]) {
				if (!this.triMode && i === 0) {
					return (i+1);
				}
				return i;
			}
		}
		return 0;
	},		
	updateCheckCls: function() {
		if (!this.wrap) {
			return;
		}		
		var cls = this.checkedCls[this.getCheckIndex()];
		this.wrap.replaceClass(this._checkCls, cls);
		this._checkCls = cls;
	},	
	getValue : function() {
		return Ext.form.Checkbox.superclass.getValue.call(this);
	},	
	initEvents : function(){
        Ext.form.Checkbox.superclass.initEvents.call(this);
        this.mon(this.wrap, {
            scope: this,
            click: this.onClick
        });
    },
	onClick: function() {
		if (!this.disabled && !this.readOnly) {
			this.setValue(this.values[(this.getCheckIndex() + 1) % this.values.length]);
		}
	},	
	setValue : function(v) {
		Ext.form.Checkbox.superclass.setValue.call(this, v);		
		this.updateCheckCls();
		this.fireEvent('check', this, this.value);
        if(this.handler){
            this.handler.call(this.scope || this, this, this.value);
        }			
        return this;
	},
	setTriMode: function (blTriMode) {
		this.triMode = blTriMode;
	}
});

Ext.reg('tricheckbox', SYNO.TriCheckbox);
//////////////////////////////////////////////////////////////////////////
///////////////// Tri-state tree node ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

Ext.tree.TriTreeNodeUI = function() {
	Ext.tree.TriTreeNodeUI.superclass.constructor.apply(this, arguments);
};

Ext.tree.TriTreeNodeUI.CHECKSTATE = 2;
Ext.tree.TriTreeNodeUI.UNCHECKSTATE = 1;
Ext.tree.TriTreeNodeUI.GRAYSTATE = 0;

Ext.extend(Ext.tree.TriTreeNodeUI, Ext.tree.TreeNodeUI, {
	values: [null, false, true],
	checkedCls: ['x-checkbox-grayed', null, 'x-checkbox-checked'],
	checkboxCls: 'x-checkbox',
	expanded: false,
	err: -1,
	
	initEvents: function() {
		Ext.tree.TriTreeNodeUI.superclass.initEvents.apply(this, arguments);
		if (this.checkbox) {
			Ext.EventManager.on(this.checkbox, 'click', this.toggleCheck, this);
		}
	},
	destroy: function() {
		if (this.checkbox) {
			Ext.EventManager.un(this.checkbox, 'click', this.toggleCheck, this);
		}
		Ext.tree.TriTreeNodeUI.superclass.destroy.apply(this, arguments);
	},
	getCheckIndex: function(n) {
		for (var i = 0; i < this.values.length; i++) {
			if (n.getUI() && n.getUI().checkbox &&
				n.getUI().checkbox.checked === this.values[i]) {
				return i;
			}
		}
		return this.err;
	},
	clearCheck: function() {
		if (true === this.node.disabled) {
			return;
		}
		this.onCheckChange(Ext.tree.TriTreeNodeUI.UNCHECKSTATE);
	},
	onCheckChange: function(index) {
		this.checkbox.checked = this.values[index];
		this.checkbox.className = this.checkedCls[index];
		if (this.node.firstChild) {
			this.updateChild(this.node.firstChild, index);
		}
		if (this.node.parentNode != this.root) {
			this.updateParent(this.node.parentNode, index);
		}
		var checked = this.checkbox.checked;
		this.node.attributes.checked = checked;
		this.fireEvent('checkchange', this.node, checked);
	},
	toggleCheck: function() {
		if (true === this.node.disabled) {
			return;
		}
		var index = this.getCheckIndex(this.node);
		index = (index === Ext.tree.TriTreeNodeUI.UNCHECKSTATE) ? Ext.tree.TriTreeNodeUI.CHECKSTATE : Ext.tree.TriTreeNodeUI.UNCHECKSTATE;
		
		this.onCheckChange(index);
	},
	updateChild: function(fd, index) {
		var tmpNode = fd;
		do {
			if (tmpNode.disabled) {
				tmpNode = tmpNode.nextSibling;
				continue;
			}
			if (tmpNode.getUI() && tmpNode.getUI().checkbox) {
				tmpNode.getUI().checkbox.checked = this.values[index];
				tmpNode.getUI().checkbox.className = this.checkedCls[index];
			}
			if (tmpNode.firstChild) {
				this.updateChild(tmpNode.firstChild, index);
			}
			tmpNode = tmpNode.nextSibling;
		} while (tmpNode);
	},
	updateParent: function(p, callerstate) {
		var calledstate = this.getCheckIndex(p);
		if (callerstate != calledstate) {
			var index = this.checkchildstate(p);
			if (p.getUI() && p.getUI().checkbox) {
				p.getUI().checkbox.checked = this.values[index];
				p.getUI().checkbox.className = this.checkedCls[index];
			}
			if (p.parentNode != this.root) {
				this.updateParent(p.parentNode, index);
			}
		}
	},
	checkchildstate: function(parent_node) {
		var tmpNode = parent_node.firstChild;
		var i;
		if (!tmpNode) {
			return this.err;
		}
		while (tmpNode) {
			if (Ext.tree.TriTreeNodeUI.UNCHECKSTATE !== this.getCheckIndex(tmpNode)) {
				return Ext.tree.TriTreeNodeUI.GRAYSTATE;
			}
			tmpNode = tmpNode.nextSibling;
		}
		return Ext.tree.TriTreeNodeUI.UNCHECKSTATE;
	},
	
	renderElements: function(n, a, targetNode, bulkRender) {
		this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';
		
		var nel, href = a.href ? a.href : Ext.isGecko ? "" : "#", 
		buf = ['<li class="x-tree-node"><div ext:tree-node-id="', Ext.util.Format.htmlEncode(n.id), '" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls, '" unselectable="on">', 
				'<span class="x-tree-node-indent">', this.indentMarkup, "</span>", 
				'<img alt="" src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />', 
				'<img alt="" src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon', (a.icon ? " x-tree-node-inline-icon" : ""), (a.iconCls ? " " + a.iconCls : ""), '" unselectable="on" />', 
				'<span><img alt="" src="' + this.emptyIcon + '" style="margin:0 2px 0 2px;" class="x-checkbox" /></span>', 
				'<a hidefocus="on" class="x-tree-node-anchor" href="', href, '" tabIndex="1" ', a.hrefTarget ? ' target="' + a.hrefTarget + '"' : "", '><span unselectable="on">', n.text, "</span></a></div>", 
				'<ul class="x-tree-node-ct" style="display:none;"></ul>', 
				"</li>"].join('');
		
		if (bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl())) {
			this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
		} else {
			this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
		}
		
		this.elNode = this.wrap.childNodes[0];
		this.ctNode = this.wrap.childNodes[1];
		var cs = this.elNode.childNodes;
		this.indentNode = cs[0];
		this.ecNode = cs[1];
		this.iconNode = cs[2];		
		this.checkbox = cs[3];
		if (a.checked === "checked") {
			this.checkbox.checked = this.values[Ext.tree.TriTreeNodeUI.CHECKSTATE];
			this.checkbox.className = this.checkedCls[Ext.tree.TriTreeNodeUI.CHECKSTATE];
		} else if (a.checked === "gray") {
			this.checkbox.checked = this.values[Ext.tree.TriTreeNodeUI.GRAYSTATE];
			this.checkbox.className = this.checkedCls[Ext.tree.TriTreeNodeUI.GRAYSTATE];
		} else {
			this.checkbox.checked = this.values[Ext.tree.TriTreeNodeUI.UNCHECKSTATE];
			this.checkbox.className = this.checkedCls[Ext.tree.TriTreeNodeUI.UNCHECKSTATE];
		}
		
		this.anchor = cs[4];
		this.textNode = cs[4].firstChild;
	}
});

Ext.namespace('SYNO.Util');

SYNO.Util.copy = function(c) {
	var seen = [], mapping = [];
	return (function(c) {
		var ret, seenIdx = seen.indexOf(c);

		if (-1 !== seenIdx) {
			return mapping[seenIdx];
		}

		if (Ext.isObject(c)) {
			ret = {};
			seen.push(c);
			mapping.push(ret);
			for(var p in c) {
				ret[p] = arguments.callee(c[p]);
			}
		} else if (Ext.isArray(c)){
			ret = [];
			seen.push(c);
			mapping.push(ret);
			for (var i=0; i<c.length; ++i) {
				ret[i] = arguments.callee(c[i]);
			}
		} else {
			ret = c;
		}
		return ret;
	})(c);
};

SYNO.Util.copyApply = function(o, c, defaults){
	if(defaults){
		arguments.callee(o, defaults);
	}
	if(o && c && typeof c == 'object'){
		for(var p in c){
			o[p] = SYNO.Util.copy(c[p]);
		}
	}
	return o;
};
/* base64.js: http://www-cs-students.stanford.edu/~tjw/jsbn/ */

SYNO = window.SYNO || {};
SYNO.Encryption = SYNO.Encryption || {};
SYNO.Encryption.Base64 = (function () {
	var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var b64pad = "=";

	return {
		hex2b64: function (h) {
			var i;
			var c;
			var ret = "";
			for (i = 0; i + 3 <= h.length; i += 3) {
				c = parseInt(h.substring(i, i + 3), 16);
				ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
			}
			if (i + 1 == h.length) {
				c = parseInt(h.substring(i, i + 1), 16);
				ret += b64map.charAt(c << 2);
			} else if (i + 2 == h.length) {
				c = parseInt(h.substring(i, i + 2), 16);
				ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
			}
			while ((ret.length & 3) > 0) {
				ret += b64pad;
			}
			return ret;
		},

		// convert a base64 string to hex
		b64tohex: function (s) {
			var ret = "";
			var i;
			var k = 0; // b64 state, 0-3
			var slop;
			for (i = 0; i < s.length; ++i) {
				if (s.charAt(i) == b64pad) {
					break;
				}
				v = b64map.indexOf(s.charAt(i));
				if (v < 0) {
					continue;
				}
				if (k == 0) {
					ret += int2char(v >> 2);
					slop = v & 3;
					k = 1;
				} else if (k == 1) {
					ret += int2char((slop << 2) | (v >> 4));
					slop = v & 0xf;
					k = 2;
				} else if (k == 2) {
					ret += int2char(slop);
					ret += int2char(v >> 2);
					slop = v & 3;
					k = 3;
				} else {
					ret += int2char((slop << 2) | (v >> 4));
					ret += int2char(v & 0xf);
					k = 0;
				}
			}
			if (k == 1) {
				ret += int2char(slop << 2);
			}
			return ret;
		},

		// convert a base64 string to a byte/number array
		b64toBA: function (s) {
			//piggyback on b64tohex for now, optimize later
			var h = b64tohex(s);
			var i;
			var a = new Array();
			for (i = 0; 2 * i < h.length; ++i) {
				a[i] = parseInt(h.substring(2 * i, 2 * i + 2), 16);
			}
			return a;
		}
	};
})();
/* jsbn.js: http://www-cs-students.stanford.edu/~tjw/jsbn/ */

// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Basic JavaScript BN library - subset useful for RSA encryption.

SYNO = window.SYNO || {};
SYNO.Encryption = SYNO.Encryption || {};
SYNO.Encryption.BigInteger = (function () {
	// Bits per digit
	var dbits;

	// JavaScript engine analysis
	var canary = 0xdeadbeefcafe;
	var j_lm = ((canary & 0xffffff) == 0xefcafe);

	// (public) Constructor

	function BigInteger(a, b, c) {
		if (a != null) {
			if ("number" == typeof a) {
				this.fromNumber(a, b, c);
			} else if (b == null && "string" != typeof a) {
				this.fromString(a, 256);
			} else {
				this.fromString(a, b);
			}
		}
	}

	// return new, unset BigInteger

	function nbi() {
		return new BigInteger(null);
	}

	// am: Compute w_j += (x*this_i), propagate carries,
	// c is initial carry, returns final carry.
	// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
	// We need to select the fastest one that works in this environment.
	// am1: use a single mult and divide to get the high bits,
	// max digit bits should be 26 because
	// max internal value = 2*dvalue^2-2*dvalue (< 2^53)

	function am1(i, x, w, j, c, n) {
		while (--n >= 0) {
			var v = x * this[i++] + w[j] + c;
			c = Math.floor(v / 0x4000000);
			w[j++] = v & 0x3ffffff;
		}
		return c;
	}
	// am2 avoids a big mult-and-extract completely.
	// Max digit bits should be <= 30 because we do bitwise ops
	// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)

	function am2(i, x, w, j, c, n) {
		var xl = x & 0x7fff,
			xh = x >> 15;
		while (--n >= 0) {
			var l = this[i] & 0x7fff;
			var h = this[i++] >> 15;
			var m = xh * l + h * xl;
			l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
			c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
			w[j++] = l & 0x3fffffff;
		}
		return c;
	}
	// Alternately, set max digit bits to 28 since some
	// browsers slow down when dealing with 32-bit numbers.

	function am3(i, x, w, j, c, n) {
		var xl = x & 0x3fff,
			xh = x >> 14;
		while (--n >= 0) {
			var l = this[i] & 0x3fff;
			var h = this[i++] >> 14;
			var m = xh * l + h * xl;
			l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
			c = (l >> 28) + (m >> 14) + xh * h;
			w[j++] = l & 0xfffffff;
		}
		return c;
	}
	if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
		BigInteger.prototype.am = am2;
		dbits = 30;
	} else if (j_lm && (navigator.appName != "Netscape")) {
		BigInteger.prototype.am = am1;
		dbits = 26;
	} else { // Mozilla/Netscape seems to prefer am3
		BigInteger.prototype.am = am3;
		dbits = 28;
	}

	BigInteger.prototype.DB = dbits;
	BigInteger.prototype.DM = ((1 << dbits) - 1);
	BigInteger.prototype.DV = (1 << dbits);

	var BI_FP = 52;
	BigInteger.prototype.FV = Math.pow(2, BI_FP);
	BigInteger.prototype.F1 = BI_FP - dbits;
	BigInteger.prototype.F2 = 2 * dbits - BI_FP;

	// Digit conversions
	var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
	var BI_RC = new Array();
	var rr, vv;
	rr = "0".charCodeAt(0);
	for (vv = 0; vv <= 9; ++vv) {
		BI_RC[rr++] = vv;
	}
	rr = "a".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) {
		BI_RC[rr++] = vv;
	}
	rr = "A".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) {
		BI_RC[rr++] = vv;
	}

	function int2char(n) {
		return BI_RM.charAt(n);
	}

	function intAt(s, i) {
		var c = BI_RC[s.charCodeAt(i)];
		return (c == null) ? -1 : c;
	}

	// (protected) copy this to r

	function bnpCopyTo(r) {
		for (var i = this.t - 1; i >= 0; --i) {
			r[i] = this[i];
		}
		r.t = this.t;
		r.s = this.s;
	}

	// (protected) set from integer value x, -DV <= x < DV

	function bnpFromInt(x) {
		this.t = 1;
		this.s = (x < 0) ? -1 : 0;
		if (x > 0) {
			this[0] = x;
		} else if (x < -1) {
			this[0] = x + DV;
		} else {
			this.t = 0;
		}
	}

	// return bigint initialized to value

	function nbv(i) {
		var r = nbi();
		r.fromInt(i);
		return r;
	}

	// (protected) set from string and radix

	function bnpFromString(s, b) {
		var k;
		if (b == 16) {
			k = 4;
		} else if (b == 8) {
			k = 3;
		} else if (b == 256) {
			k = 8;
		} // byte array
		else if (b == 2) {
			k = 1;
		} else if (b == 32) {
			k = 5;
		} else if (b == 4) {
			k = 2;
		} else {
			this.fromRadix(s, b);
			return;
		}
		this.t = 0;
		this.s = 0;
		var i = s.length,
			mi = false,
			sh = 0;
		while (--i >= 0) {
			var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
			if (x < 0) {
				if (s.charAt(i) == "-") {
					mi = true;
				}
				continue;
			}
			mi = false;
			if (sh == 0) {
				this[this.t++] = x;
			} else if (sh + k > this.DB) {
				this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
				this[this.t++] = (x >> (this.DB - sh));
			} else {
				this[this.t - 1] |= x << sh;
			}
			sh += k;
			if (sh >= this.DB) {
				sh -= this.DB;
			}
		}
		if (k == 8 && (s[0] & 0x80) != 0) {
			this.s = -1;
			if (sh > 0) {
				this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
			}
		}
		this.clamp();
		if (mi) {
			BigInteger.ZERO.subTo(this, this);
		}
	}

	// (protected) clamp off excess high words

	function bnpClamp() {
		var c = this.s & this.DM;
		while (this.t > 0 && this[this.t - 1] == c) {
			--this.t;
		}
	}

	// (public) return string representation in given radix

	function bnToString(b) {
		if (this.s < 0) {
			return "-" + this.negate().toString(b);
		}
		var k;
		if (b == 16) {
			k = 4;
		} else if (b == 8) {
			k = 3;
		} else if (b == 2) {
			k = 1;
		} else if (b == 32) {
			k = 5;
		} else if (b == 4) {
			k = 2;
		} else {
			return this.toRadix(b);
		}
		var km = (1 << k) - 1,
			d, m = false,
			r = "",
			i = this.t;
		var p = this.DB - (i * this.DB) % k;
		if (i-- > 0) {
			if (p < this.DB && (d = this[i] >> p) > 0) {
				m = true;
				r = int2char(d);
			}
			while (i >= 0) {
				if (p < k) {
					d = (this[i] & ((1 << p) - 1)) << (k - p);
					d |= this[--i] >> (p += this.DB - k);
				} else {
					d = (this[i] >> (p -= k)) & km;
					if (p <= 0) {
						p += this.DB;
						--i;
					}
				}
				if (d > 0) {
					m = true;
				}
				if (m) {
					r += int2char(d);
				}
			}
		}
		return m ? r : "0";
	}

	// (public) -this

	function bnNegate() {
		var r = nbi();
		BigInteger.ZERO.subTo(this, r);
		return r;
	}

	// (public) |this|

	function bnAbs() {
		return (this.s < 0) ? this.negate() : this;
	}

	// (public) return + if this > a, - if this < a, 0 if equal

	function bnCompareTo(a) {
		var r = this.s - a.s;
		if (r != 0) {
			return r;
		}
		var i = this.t;
		r = i - a.t;
		if (r != 0) {
			return r;
		}
		while (--i >= 0) {
			if ((r = this[i] - a[i]) != 0) {
				return r;
			}
		}
		return 0;
	}

	// returns bit length of the integer x

	function nbits(x) {
		var r = 1,
			t;
		if ((t = x >>> 16) != 0) {
			x = t;
			r += 16;
		}
		if ((t = x >> 8) != 0) {
			x = t;
			r += 8;
		}
		if ((t = x >> 4) != 0) {
			x = t;
			r += 4;
		}
		if ((t = x >> 2) != 0) {
			x = t;
			r += 2;
		}
		if ((t = x >> 1) != 0) {
			x = t;
			r += 1;
		}
		return r;
	}

	// (public) return the number of bits in "this"

	function bnBitLength() {
		if (this.t <= 0) {
			return 0;
		}
		return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
	}

	// (protected) r = this << n*DB

	function bnpDLShiftTo(n, r) {
		var i;
		for (i = this.t - 1; i >= 0; --i) {
			r[i + n] = this[i];
		}
		for (i = n - 1; i >= 0; --i) {
			r[i] = 0;
		}
		r.t = this.t + n;
		r.s = this.s;
	}

	// (protected) r = this >> n*DB

	function bnpDRShiftTo(n, r) {
		for (var i = n; i < this.t; ++i) {
			r[i - n] = this[i];
		}
		r.t = Math.max(this.t - n, 0);
		r.s = this.s;
	}

	// (protected) r = this << n

	function bnpLShiftTo(n, r) {
		var bs = n % this.DB;
		var cbs = this.DB - bs;
		var bm = (1 << cbs) - 1;
		var ds = Math.floor(n / this.DB),
			c = (this.s << bs) & this.DM,
			i;
		for (i = this.t - 1; i >= 0; --i) {
			r[i + ds + 1] = (this[i] >> cbs) | c;
			c = (this[i] & bm) << bs;
		}
		for (i = ds - 1; i >= 0; --i) {
			r[i] = 0;
		}
		r[ds] = c;
		r.t = this.t + ds + 1;
		r.s = this.s;
		r.clamp();
	}

	// (protected) r = this >> n

	function bnpRShiftTo(n, r) {
		r.s = this.s;
		var ds = Math.floor(n / this.DB);
		if (ds >= this.t) {
			r.t = 0;
			return;
		}
		var bs = n % this.DB;
		var cbs = this.DB - bs;
		var bm = (1 << bs) - 1;
		r[0] = this[ds] >> bs;
		for (var i = ds + 1; i < this.t; ++i) {
			r[i - ds - 1] |= (this[i] & bm) << cbs;
			r[i - ds] = this[i] >> bs;
		}
		if (bs > 0) {
			r[this.t - ds - 1] |= (this.s & bm) << cbs;
		}
		r.t = this.t - ds;
		r.clamp();
	}

	// (protected) r = this - a

	function bnpSubTo(a, r) {
		var i = 0,
			c = 0,
			m = Math.min(a.t, this.t);
		while (i < m) {
			c += this[i] - a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		if (a.t < this.t) {
			c -= a.s;
			while (i < this.t) {
				c += this[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c += this.s;
		} else {
			c += this.s;
			while (i < a.t) {
				c -= a[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c -= a.s;
		}
		r.s = (c < 0) ? -1 : 0;
		if (c < -1) {
			r[i++] = this.DV + c;
		} else if (c > 0) {
			r[i++] = c;
		}
		r.t = i;
		r.clamp();
	}

	// (protected) r = this * a, r != this,a (HAC 14.12)
	// "this" should be the larger one if appropriate.

	function bnpMultiplyTo(a, r) {
		var x = this.abs(),
			y = a.abs();
		var i = x.t;
		r.t = i + y.t;
		while (--i >= 0) {
			r[i] = 0;
		}
		for (i = 0; i < y.t; ++i) {
			r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
		}
		r.s = 0;
		r.clamp();
		if (this.s != a.s) {
			BigInteger.ZERO.subTo(r, r);
		}
	}

	// (protected) r = this^2, r != this (HAC 14.16)

	function bnpSquareTo(r) {
		var i, x = this.abs();
		i = r.t = 2 * x.t;
		while (--i >= 0) {
			r[i] = 0;
		}
		for (i = 0; i < x.t - 1; ++i) {
			var c = x.am(i, x[i], r, 2 * i, 0, 1);
			if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
				r[i + x.t] -= x.DV;
				r[i + x.t + 1] = 1;
			}
		}
		if (r.t > 0) {
			r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
		}
		r.s = 0;
		r.clamp();
	}

	// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
	// r != q, this != m.  q or r may be null.

	function bnpDivRemTo(m, q, r) {
		var pm = m.abs();
		if (pm.t <= 0) {
			return;
		}
		var pt = this.abs();
		if (pt.t < pm.t) {
			if (q != null) {
				q.fromInt(0);
			}
			if (r != null) {
				this.copyTo(r);
			}
			return;
		}
		if (r == null) {
			r = nbi();
		}
		var y = nbi(),
			ts = this.s,
			ms = m.s;
		var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
		if (nsh > 0) {
			pm.lShiftTo(nsh, y);
			pt.lShiftTo(nsh, r);
		} else {
			pm.copyTo(y);
			pt.copyTo(r);
		}
		var ys = y.t;
		var y0 = y[ys - 1];
		if (y0 == 0) {
			return;
		}
		var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
		var d1 = this.FV / yt,
			d2 = (1 << this.F1) / yt,
			e = 1 << this.F2;
		var i = r.t,
			j = i - ys,
			t = (q == null) ? nbi() : q;
		y.dlShiftTo(j, t);
		if (r.compareTo(t) >= 0) {
			r[r.t++] = 1;
			r.subTo(t, r);
		}
		BigInteger.ONE.dlShiftTo(ys, t);
		t.subTo(y, y); // "negative" y so we can replace sub with am later
		while (y.t < ys) {
			y[y.t++] = 0;
		}
		while (--j >= 0) {
			// Estimate quotient digit
			var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
			if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
				y.dlShiftTo(j, t);
				r.subTo(t, r);
				while (r[i] < --qd) {
					r.subTo(t, r);
				}
			}
		}
		if (q != null) {
			r.drShiftTo(ys, q);
			if (ts != ms) {
				BigInteger.ZERO.subTo(q, q);
			}
		}
		r.t = ys;
		r.clamp();
		if (nsh > 0) {
			r.rShiftTo(nsh, r);
		} // Denormalize remainder
		if (ts < 0) {
			BigInteger.ZERO.subTo(r, r);
		}
	}

	// (public) this mod a

	function bnMod(a) {
		var r = nbi();
		this.abs().divRemTo(a, null, r);
		if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
			a.subTo(r, r);
		}
		return r;
	}

	// Modular reduction using "classic" algorithm

	function Classic(m) {
		this.m = m;
	}

	function cConvert(x) {
		if (x.s < 0 || x.compareTo(this.m) >= 0) {
			return x.mod(this.m);
		} else {
			return x;
		}
	}

	function cRevert(x) {
		return x;
	}

	function cReduce(x) {
		x.divRemTo(this.m, null, x);
	}

	function cMulTo(x, y, r) {
		x.multiplyTo(y, r);
		this.reduce(r);
	}

	function cSqrTo(x, r) {
		x.squareTo(r);
		this.reduce(r);
	}

	Classic.prototype.convert = cConvert;
	Classic.prototype.revert = cRevert;
	Classic.prototype.reduce = cReduce;
	Classic.prototype.mulTo = cMulTo;
	Classic.prototype.sqrTo = cSqrTo;

	// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
	// justification:
	//         xy == 1 (mod m)
	//         xy =  1+km
	//   xy(2-xy) = (1+km)(1-km)
	// x[y(2-xy)] = 1-k^2m^2
	// x[y(2-xy)] == 1 (mod m^2)
	// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
	// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
	// JS multiply "overflows" differently from C/C++, so care is needed here.

	function bnpInvDigit() {
		if (this.t < 1) {
			return 0;
		}
		var x = this[0];
		if ((x & 1) == 0) {
			return 0;
		}
		var y = x & 3; // y == 1/x mod 2^2
		y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
		y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
		y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
		// last step - calculate inverse mod DV directly;
		// assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
		y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
		// we really want the negative inverse, and -DV < y < DV
		return (y > 0) ? this.DV - y : -y;
	}

	// Montgomery reduction

	function Montgomery(m) {
		this.m = m;
		this.mp = m.invDigit();
		this.mpl = this.mp & 0x7fff;
		this.mph = this.mp >> 15;
		this.um = (1 << (m.DB - 15)) - 1;
		this.mt2 = 2 * m.t;
	}

	// xR mod m

	function montConvert(x) {
		var r = nbi();
		x.abs().dlShiftTo(this.m.t, r);
		r.divRemTo(this.m, null, r);
		if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
			this.m.subTo(r, r);
		}
		return r;
	}

	// x/R mod m

	function montRevert(x) {
		var r = nbi();
		x.copyTo(r);
		this.reduce(r);
		return r;
	}

	// x = x/R mod m (HAC 14.32)

	function montReduce(x) {
		while (x.t <= this.mt2) { // pad x so am has enough room later
			x[x.t++] = 0;
		}
		for (var i = 0; i < this.m.t; ++i) {
			// faster way of calculating u0 = x[i]*mp mod DV
			var j = x[i] & 0x7fff;
			var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
			// use am to combine the multiply-shift-add into one call
			j = i + this.m.t;
			x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
			// propagate carry
			while (x[j] >= x.DV) {
				x[j] -= x.DV;
				x[++j]++;
			}
		}
		x.clamp();
		x.drShiftTo(this.m.t, x);
		if (x.compareTo(this.m) >= 0) {
			x.subTo(this.m, x);
		}
	}

	// r = "x^2/R mod m"; x != r

	function montSqrTo(x, r) {
		x.squareTo(r);
		this.reduce(r);
	}

	// r = "xy/R mod m"; x,y != r

	function montMulTo(x, y, r) {
		x.multiplyTo(y, r);
		this.reduce(r);
	}

	Montgomery.prototype.convert = montConvert;
	Montgomery.prototype.revert = montRevert;
	Montgomery.prototype.reduce = montReduce;
	Montgomery.prototype.mulTo = montMulTo;
	Montgomery.prototype.sqrTo = montSqrTo;

	// (protected) true iff this is even

	function bnpIsEven() {
		return 0 == ((this.t > 0) ? (this[0] & 1) : this.s);
	}

	// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)

	function bnpExp(e, z) {
		if (e > 0xffffffff || e < 1) {
			return BigInteger.ONE;
		}
		var r = nbi(),
			r2 = nbi(),
			g = z.convert(this),
			i = nbits(e) - 1;
		g.copyTo(r);
		while (--i >= 0) {
			z.sqrTo(r, r2);
			if ((e & (1 << i)) > 0) {
				z.mulTo(r2, g, r);
			} else {
				var t = r;
				r = r2;
				r2 = t;
			}
		}
		return z.revert(r);
	}

	// (public) this^e % m, 0 <= e < 2^32

	function bnModPowInt(e, m) {
		var z;
		if (e < 256 || m.isEven()) {
			z = new Classic(m);
		} else {
			z = new Montgomery(m);
		}
		return this.exp(e, z);
	}

	// protected
	BigInteger.prototype.copyTo = bnpCopyTo;
	BigInteger.prototype.fromInt = bnpFromInt;
	BigInteger.prototype.fromString = bnpFromString;
	BigInteger.prototype.clamp = bnpClamp;
	BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
	BigInteger.prototype.drShiftTo = bnpDRShiftTo;
	BigInteger.prototype.lShiftTo = bnpLShiftTo;
	BigInteger.prototype.rShiftTo = bnpRShiftTo;
	BigInteger.prototype.subTo = bnpSubTo;
	BigInteger.prototype.multiplyTo = bnpMultiplyTo;
	BigInteger.prototype.squareTo = bnpSquareTo;
	BigInteger.prototype.divRemTo = bnpDivRemTo;
	BigInteger.prototype.invDigit = bnpInvDigit;
	BigInteger.prototype.isEven = bnpIsEven;
	BigInteger.prototype.exp = bnpExp;

	// public
	BigInteger.prototype.toString = bnToString;
	BigInteger.prototype.negate = bnNegate;
	BigInteger.prototype.abs = bnAbs;
	BigInteger.prototype.compareTo = bnCompareTo;
	BigInteger.prototype.bitLength = bnBitLength;
	BigInteger.prototype.mod = bnMod;
	BigInteger.prototype.modPowInt = bnModPowInt;

	// "constants"
	BigInteger.ZERO = nbv(0);
	BigInteger.ONE = nbv(1);

	return BigInteger;
})();
/* merged from prng4.js and rng.js: http://www-cs-students.stanford.edu/~tjw/jsbn/ */

// For best results, put code like
// <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
// in your main HTML document.

SYNO = window.SYNO || {};
SYNO.Encryption = SYNO.Encryption || {};
SYNO.Encryption.SecureRandom = (function () {
	// prng4.js - uses Arcfour as a PRNG

	function Arcfour() {
		this.i = 0;
		this.j = 0;
		this.S = new Array();
	}

	// Initialize arcfour context from key, an array of ints, each from [0..255]


	function ARC4init(key) {
		var i, j, t;
		for (i = 0; i < 256; ++i) {
			this.S[i] = i;
		}
		j = 0;
		for (i = 0; i < 256; ++i) {
			j = (j + this.S[i] + key[i % key.length]) & 255;
			t = this.S[i];
			this.S[i] = this.S[j];
			this.S[j] = t;
		}
		this.i = 0;
		this.j = 0;
	}

	function ARC4next() {
		var t;
		this.i = (this.i + 1) & 255;
		this.j = (this.j + this.S[this.i]) & 255;
		t = this.S[this.i];
		this.S[this.i] = this.S[this.j];
		this.S[this.j] = t;
		return this.S[(t + this.S[this.i]) & 255];
	}

	Arcfour.prototype.init = ARC4init;
	Arcfour.prototype.next = ARC4next;

	// Plug in your RNG constructor here


	function prng_newstate() {
		return new Arcfour();
	}

	// Pool size must be a multiple of 4 and greater than 32.
	// An array of bytes the size of the pool will be passed to init()
	var rng_psize = 256;


	// Random number generator - requires a PRNG backend, e.g. prng4.js
	var rng_state;
	var rng_pool;
	var rng_pptr;

	// Mix in a 32-bit integer into the pool


	function rng_seed_int(x) {
		rng_pool[rng_pptr++] ^= x & 255;
		rng_pool[rng_pptr++] ^= (x >> 8) & 255;
		rng_pool[rng_pptr++] ^= (x >> 16) & 255;
		rng_pool[rng_pptr++] ^= (x >> 24) & 255;
		if (rng_pptr >= rng_psize) {
			rng_pptr -= rng_psize;
		}
	}

	// Mix in the current time (w/milliseconds) into the pool


	function rng_seed_time() {
		rng_seed_int(new Date().getTime());
	}

	// Initialize the pool with junk if needed.
	if (rng_pool == null) {
		rng_pool = new Array();
		rng_pptr = 0;
		var t;
		if (navigator.appName == "Netscape" && navigator.appVersion < "5" && window.crypto) {
			// Extract entropy (256 bits) from NS4 RNG if available
			var z = window.crypto.random(32);
			for (t = 0; t < z.length; ++t) {
				rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
			}
		}
		while (rng_pptr < rng_psize) { // extract some randomness from Math.random()
			t = Math.floor(65536 * Math.random());
			rng_pool[rng_pptr++] = t >>> 8;
			rng_pool[rng_pptr++] = t & 255;
		}
		rng_pptr = 0;
		rng_seed_time();
		//rng_seed_int(window.screenX);
		//rng_seed_int(window.screenY);
	}

	function rng_get_byte() {
		if (rng_state == null) {
			rng_seed_time();
			rng_state = prng_newstate();
			rng_state.init(rng_pool);
			for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) {
				rng_pool[rng_pptr] = 0;
			}
			rng_pptr = 0;
			//rng_pool = null;
		}
		// TODO: allow reseeding after first request
		return rng_state.next();
	}

	function rng_get_bytes(ba) {
		var i;
		for (i = 0; i < ba.length; ++i) {
			ba[i] = rng_get_byte();
		}
	}

	function SecureRandom() {}

	SecureRandom.prototype.nextBytes = rng_get_bytes;

	SecureRandom.rng_seed_time = rng_seed_time;
	return SecureRandom;
})();
/* rsa.js: http://www-cs-students.stanford.edu/~tjw/jsbn/ */

// Depends on jsbn.js and rng.js
// Version 1.1: support utf-8 encoding in pkcs1pad2

SYNO = window.SYNO || {};
SYNO.Encryption = SYNO.Encryption || {};
SYNO.Encryption.RSA = (function () {

	// convert a (hex) string to a bignum object


	function parseBigInt(str, r) {
		return new SYNO.Encryption.BigInteger(str, r);
	}

	function byte2Hex(b) {
		if (b < 0x10) {
			return "0" + b.toString(16);
		}
		return b.toString(16);
	}

	// PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint


	function pkcs1pad2(s, n) {
		if (n < s.length + 11) { // TODO: fix for utf-8
			//alert("Message too long for RSA");
			return null;
		}
		var ba = new Array();
		var i = s.length - 1;
		while (i >= 0 && n > 0) {
			var c = s.charCodeAt(i--);
			if (c < 128) { // encode using utf-8
				ba[--n] = c;
			} else if ((c > 127) && (c < 2048)) {
				ba[--n] = (c & 63) | 128;
				ba[--n] = (c >> 6) | 192;
			} else {
				ba[--n] = (c & 63) | 128;
				ba[--n] = ((c >> 6) & 63) | 128;
				ba[--n] = (c >> 12) | 224;
			}
		}
		ba[--n] = 0;
		var rng = new SYNO.Encryption.SecureRandom();
		var x = new Array();
		while (n > 2) { // random non-zero pad
			x[0] = 0;
			while (x[0] == 0) {
				rng.nextBytes(x);
			}
			ba[--n] = x[0];
		}
		ba[--n] = 2;
		ba[--n] = 0;
		return new SYNO.Encryption.BigInteger(ba);
	}

	// "empty" RSA key constructor


	function RSAKey() {
		this.n = null;
		this.e = 0;
		this.d = null;
		this.p = null;
		this.q = null;
		this.dmp1 = null;
		this.dmq1 = null;
		this.coeff = null;
	}

	// Set the public key fields N and e from hex strings


	function RSASetPublic(N, E) {
		if (N != null && E != null && N.length > 0 && E.length > 0) {
			this.n = parseBigInt(N, 16);
			this.e = parseInt(E, 16);
		} else {
			//alert("Invalid RSA public key");
		}
	}

	// Perform raw public operation on "x": return x^e (mod n)


	function RSADoPublic(x) {
		return x.modPowInt(this.e, this.n);
	}

	// Return the PKCS#1 RSA encryption of "text" as an even-length hex string


	function RSAEncrypt(text) {
		var m = pkcs1pad2(text, (this.n.bitLength() + 7) >> 3);
		if (m == null) {
			return null;
		}
		var c = this.doPublic(m);
		if (c == null) {
			return null;
		}
		var h = c.toString(16);
		if ((h.length & 1) == 0) {
			return h;
		} else {
			return "0" + h;
		}
	}

	// Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
	//function RSAEncryptB64(text) {
	//  var h = this.encrypt(text);
	//  if(h) return hex2b64(h); else return null;
	//}
	// protected
	RSAKey.prototype.doPublic = RSADoPublic;

	// public
	RSAKey.prototype.setPublic = RSASetPublic;
	RSAKey.prototype.encrypt = RSAEncrypt;
	//RSAKey.prototype.encrypt_b64 = RSAEncryptB64;
	return RSAKey;
})();
SYNO = window.SYNO || {};
SYNO.Encryption = SYNO.Encryption || {};

SYNO.Encryption.CipherKey = '';
SYNO.Encryption.RSAModulus = '';
SYNO.Encryption.CipherToken = '';
SYNO.Encryption.TimeBias = 0;

SYNO.Encryption.EncryptParam = function(params) {
	var engine, text, prepare = {}, result = {};

	if (!SYNO.Encryption.CipherKey || !SYNO.Encryption.RSAModulus || !SYNO.Encryption.CipherToken) {
		return params;
	}

	engine = new SYNO.Encryption.RSA();
	engine.setPublic(SYNO.Encryption.RSAModulus, '10001');

	Ext.apply(prepare, params);
	prepare[SYNO.Encryption.CipherToken] = Math.floor(+new Date()/1000) + SYNO.Encryption.TimeBias;

	text = engine.encrypt(Ext.urlEncode(prepare));
	if (!text) {
		return params;
	}

	result[SYNO.Encryption.CipherKey] = SYNO.Encryption.Base64.hex2b64(text);
	return result;
};
