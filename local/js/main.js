
class Message {

	type = null;
	data = null;

	constructor(type, data=null) {
		this.type = type;
		this.data = data;
		return;
	};

};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class Dialog {
	constructor(api, selector) {
		this.api = api;
		this.el = jQuery(selector);
		this.bindCloseButton();
		return;
	};

	bindCloseButton() {

		this.el.find('.Close')
		.on('click', this.hide.bind(this));

		return;
	};

	show() {

		this.el
		.removeClass('d-none');

		jQuery('#Overlay')
		.removeClass('d-none');

		return;
	};

	hide() {

		this.el
		.addClass('d-none');

		jQuery('#Overlay')
		.addClass('d-none');

		return;
	};
}

class DialogProjectNew
extends Dialog {
	constructor(api, selector='#DialogProjectNew') {
		super(api, selector);
		this.chooser = this.el.find('#ProjectFolderChoose');
		this.bindTypeSelector();
		this.bindSaveButton();
		this.bindFolderChooser();
		return;
	};

	bindTypeSelector() {

		let self = this;

		(this.el.find('#ProjectNewType .btn'))
		.on('click', function(){

			let that = jQuery(this);
			let selector = that.parent();
			let type = that.attr('data-type');

			// dedcide which button is lit.

			selector
			.find('.btn')
			.addClass('btn-dark')
			.removeClass('btn-primary');

			that
			.addClass('btn-primary')
			.removeClass('btn-dark');

			// display the selected type input form.

			(self.el.find('.ProjectNewForm'))
			.addClass('d-none');

			(self.el.find(that.attr('data-show')))
			.removeClass('d-none');

			// allow progress when type is selected and make note of.

			(self.el.find('footer'))
			.removeClass('d-none');

			(self.el.find('#ProjectNewType'))
			.attr('data-selected', type);

			// reset the file chooser.

			self.setDirectory(null);

			return;
		});

		return;
	};

	bindSaveButton() {

		let self = this;

		self.el.find('#ProjectNewSave')
		.on('click',function(){

			let type = self.el.find('#ProjectNewType').attr('data-selected');
			let name = jQuery.trim(self.el.find('#ProjectNewName').val());
			let uri = null;

			switch(type) {
				case 'local':
					uri = jQuery.trim(
						self.el.find('#ProjectFolderChoose')
						.attr('data-uri')
					);
				break;
				case 'ssh':
					let user = jQuery.trim(self.el.find('#ProjectNewSshUser').val());
					let host = jQuery.trim(self.el.find('#ProjectNewSshHost').val());
					let path = jQuery.trim(self.el.find('#ProjectNewSshPath').val());
					uri = `vscode-remote://ssh-remote+${user}@${host}${path}`;
				break;
				case 'promode':
					uri = jQuery.trim(
						self.el.find('#ProjectNewPromodeEntry')
						.val()
					);
				break;
			}

			if(uri === null || uri === '')
			return;

			(self.el.find('.Close'))
			.trigger('click');

			self.api.send(new Message('projectnew', { name, uri }));
			return;
		});

		return;
	};

	bindFolderChooser() {

		let self = this;

		self.el.find('#ProjectFolderChoose')
		.on('click', function(){
			self.api.send(new Message('pickdir'));
			return;
		});

		return;
	};

	setDirectory(input) {

		if(input === null) {
			this.chooser
			.removeClass('cased')
			.text(this.chooser.attr('data-default'))
			.attr('data-uri', '');

			return;
		}

		this.chooser
		.addClass('cased')
		.text(input.label)
		.attr('data-uri', input.uri);

		return;
	};
};

class DialogProjectDelete
extends Dialog {
	constructor(api, selector='#DialogProjectDelete') {
		super(api, selector);
		this.bindAcceptButton();
		this.bindCancelButton();
		return;
	};

	bindAcceptButton() {

		let self = this;

		this.el.find('#ProjectDeleteAccept')
		.on('click',function(){
			let id = jQuery.trim(self.el.attr('data-id'));

			if(!id)
			return;

			self.api.send(new Message(
				'projectdel',
				{ id }
			));

			self.hide();

			return false;
		});

		return;
	};

	bindCancelButton() {

		this.el.find('#ProjectDeleteCancel')
		.on('click', this.hide.bind(this));

		return;
	};

	show(id) {

		this.el.attr('data-id', id);

		jQuery('*[data-toggle=dropdown')
		.dropdown('hide');

		super.show();
		return;
	};

	hide() {

		this.el.attr('data-id', '');

		super.hide();
		return;
	};
};

class DialogProjectEdit
extends Dialog {
	constructor(api, selector='#DialogProjectEdit') {
		super(api, selector);
		return;
	};
};

class DialogDashboardConfig
extends Dialog {
	constructor(api, selector='#DialogDashboardConfig') {
		super(api, selector);
		this.bindElements();
		this.bindPresetButtons();
		this.bindAcceptButton();
		this.bindCancelButton();
		return;
	};

	bindElements() {

		this.inputTitle = this.el.find('#DashboardConfigTitle');
		this.inputColumnSizing = this.el.find('#DashboardConfigColumnSizing');

		this.btnColumnSizingPresets = this.el.find('.DashboardColumnPreset');
		this.btnAccept = this.el.find('#DashboardConfigSave');
		this.btnCancel = this.el.find('#DashboardConfigCancel');

		return;
	};

	bindPresetButtons() {

		let self = this;

		self.btnColumnSizingPresets
		.on('click', function(){

			let that = jQuery(this);
			let value = that.attr('data-value');

			self.inputColumnSizing
			.val(value);

			return;
		});

		return;
	};

	bindAcceptButton() {

		let self = this;

		(this.btnAccept)
		.on('click',function() {

			let config = {
				title: self.inputTitle.tval(),
				columnSizing: self.inputColumnSizing.tval()
			};

			self.api.send(new Message('configset', config));

			self.hide();

			return false;
		});

		return;
	};

	bindCancelButton() {

		(this.btnCancel)
		.on('click', this.hide.bind(this));

		return;
	};

	fillConfigValues() {

		this.inputTitle.val(this.api.title);
		this.inputColumnSizing.val(this.api.columnSizing);

		return;
	};

	show() {
		this.fillConfigValues();
		super.show();
		return;
	};

};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class Project {
	constructor(api, item) {
		this.api = api;
		this.item = item;
		this.el = this.api.template.clone();
		this.bindElements();
		return;
	};

	bindElements() {

		let self = this;

		self.el.find('.Icon i')
		.addClass(`codicon-${self.item.icon}`);

		self.el.find('.Name')
		.text(self.item.name);

		self.el.find('.Path')
		.text(Dashboard.readableURI(self.item.path));

		// clicking the delete button

		self.el.find('.Delete')
		.on('click', function(){
			self.api.dialog.projectDelete.show(self.item.id)
			return false;
		});

		self.el.find('.Config')
		.dropdown();

		// clicking the main button will open the project.

		self.el
		.attr('data-id', self.item.id)
		.on('click', function(){
			self.api.onProjectClick(self.item);
			return false;
		});

		// use the configured column sizing. main trick here is bootstrap's
		// column clases are tehdumb and must be the first in the list as
		// they use some of those pattern matching selectors. so strip out
		// all the old size classes, then put the new ones on the front of
		// whatever was leftover.

		self.el
		.removeClassEx(/^col/)
		.addClass(`${this.api.columnSizing} ${self.el.attr('class')}`);

		return;
	};
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class Dashboard {

	elMain = null;
	elMessageDebug = null;
	elToolbar = null;
	elProjectBox = null;
	body = null;
	template = null;
	dialog = {};

	// official config values.

	database = null;
	title = 'Dashboard';
	debug = false;
	database = [];
	columnSizing = 'col-12';
	tabMode = true;
	showPath = true;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	constructor() {
		this.init();
		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	init() {

		this.vscode = acquireVsCodeApi();
		this.body = jQuery('body');
		this.elMain = jQuery('#Dashboard')
		this.elProjectBox = jQuery('#ProjectBox');
		this.elToolbar = jQuery('#Toolbar');
		this.elMessageDebug = jQuery('#Debug');
		this.setDebug(this.debug);

		this.template = (
			(this.elProjectBox)
			.find('.Template')
			.remove()
			.clone()
			.removeClass('d-none')
			.removeClass('Template')
		);

		jQuery(window)
		.on('message', this.onMessage.bind(this));

		this.prepareUI();

		(this.vscode)
		.postMessage(new Message('hey'));

		return;
	};

	render() {

		if(!this.database)
		return;

		////////

		let self = this;

		(this.body)
		.find('.DashboardTitle')
		.text(this.title);

		this.renderProjectEntries();

		return;
	};

	renderProjectEntries() {

		this.elProjectBox.empty();

		for(const item of this.database)
		this.elProjectBox.append((new Project(this, item)).el);

		// update their sizing

		/*
		this.elProjectBox
		.children()
		.each(function(){
			jQuery(this)
			.removeClassEx(/^col/)
			.addClass(self.columnSizing);
			return;
		});
		*/

		return;
	};

	send(msg) {

		(this.vscode)
		.postMessage(msg);

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	debugMessage(msg) {

		(this.elMessageDebug)
		.find('code')
		.empty()
		.text(JSON.stringify(msg, null, "\t"));

		console.log(msg);
		return;
	};

	setDebug(state) {

		this.debug = state;

		if(this.debug) {
			(this.elMessageDebug)
			.removeClass('d-none');
		}

		else {
			(this.elMessageDebug)
			.addClass('d-none');
		}

		console.log(`[Dashboard] debug set to: ${this.debug}`);
		return this;
	};

	prepareUI() {

		this.dialog.config = new DialogDashboardConfig(this);
		this.dialog.projectNew = new DialogProjectNew(this);
		this.dialog.projectDelete = new DialogProjectDelete(this);

		jQuery('.CmdProjectNew')
		.on('click', this.dialog.projectNew.show.bind(this.dialog.projectNew));

		jQuery('.CmdDashboardConfig')
		.on('click', this.dialog.config.show.bind(this.dialog.config));

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	onMessage(ev) {

		let msg = new Message(
			ev.originalEvent.data.type,
			ev.originalEvent.data.data
		);

		if(this.debug)
		this.debugMessage(msg);

		switch(msg.type) {
			case 'sup': this.onHeySup(msg); break;
			case 'render': this.onRender(msg); break;
			case 'dirpick': this.onDirPicked(msg); break;
		}

		return;
	};

	onHeySup(msg) {

		// copy in config info.

		for(const key in msg.data)
		if(typeof this[key] !== 'undefined') {
			//console.log(`${key} = ${msg.data[key]}`);
			this[key] = msg.data[key];
		}

		// set debug.

		this.setDebug(msg.data.debug);

		if(this.debug)
		this.debugMessage(msg);

		// proceed.

		this.render();
		return;
	};

	onDirPicked(msg) {

		this.dialog.projectNew.setDirectory(msg.data);
		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	onProjectClick(item) {

		let id = item.attr('data-id');

		this.send(new Message('open', { id }));
		return;
	};

	onProjectDelete(item) {

		this.dialog.projectDelete.show(item.id);
		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	static readableURI(input) {

		if(input.match(/^file:/))
		return decodeURIComponent(input.replace(/^file:\/\/\/?/,''));

		if(input.match(/^vscode-remote:/))
		return input.replace(/vscode-remote:\/\/(?:[a-z0-9\-]*\+)?/,'');

		return input;
	};

};

jQuery(document)
.ready(function(){
	new Dashboard;
	return;
});
