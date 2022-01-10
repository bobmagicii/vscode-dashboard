import colours from './ext/colours.js';
import icons from './ext/icons.js';

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

class TemplatedDialog {

	constructor(api, selector) {
		this.api = api;

		this.el = (
			jQuery(selector)
			.clone()
			.removeAttr('id')
			.removeClass('Template')
			.removeClass('d-none')
		);

		this.overlay = jQuery('#Overlay');
		this.mount = this.overlay.find('.Mount');

		this.bindCloseButton();

		return;
	};

	bindCloseButton() {

		this.btnClose = this.el.find('.Close');
		this.btnClose.on('click', this.destroy.bind(this));

		return;
	};

	destroy() {

		this.hide();

		(this.el)
		.remove();

		delete this.el;

		return;
	};

	hide() {

		(this.el)
		.detach();

		(this.overlay)
		.addClass('d-none');

		return;
	};

	show() {

		jQuery('*[data-toggle=dropdown')
		.dropdown('hide');

		(this.mount)
		.append(this.el);

		(this.overlay)
		.removeClass('d-none');

		return;
	};

};

class Folder {
	constructor(api, item) {
		this.id = item.id;
		this.api = api;
		this.item = item;
		this.el = this.api.template.folder.clone();
		this.bindElements();
		this.prepareElements();
		this.fillWithProjects();
		return;
	};

	bindElements() {

		this.container = this.el.find('.ProjectEntry');
		this.icon = this.el.find('.Icon i');
		this.name = this.el.find('.Name');
		this.btnDelete = this.el.find('.Delete');
		this.btnEdit = this.el.find('.Edit');
		this.btnReorder = this.el.find('.Reorder');
		this.btnConfig = this.el.find('.Config');
		this.btnProject = this.el.find('.NewProject');
		this.projects = this.el.find('.Projects');

		return;
	};

	prepareElements() {

		let self = this;

		self.container
		.css('border-color', self.item.accent);

		self.icon
		.addClass(`${self.item.icon}`);

		self.name
		.text(self.item.name);

		self.btnDelete
		.on('click', function(){
			new ProjectDelete(self.api, self.item);
			return false;
		});

		self.btnEdit
		.on('click', function(){
			new ProjectConfig(self.api, self.item);
			return false;
		});

		self.btnReorder
		.on('mousedown.reorder', function(ev){
			self.handleReordering(ev);
			return false;
		});

		self.btnProject
		.on('click', function(){
			self.el.addClass('Open');
			new ProjectNew(self.api, self.item.id);
			return;
		});

		self.btnConfig
		.dropdown();

		self.el
		.attr('data-id', self.item.id);

		self.el.find('.Fold')
		.on('click', function(){
			self.el.toggleClass('Open');

			if(self.el.hasClass('Open'))
			self.api.send(new Message('folderopen', { id: self.item.id }));
			else
			self.api.send(new Message('folderclose', { id: self.item.id }));

			return false;
		});

		if(self.item.open)
		self.el.addClass('Open');

		// use the configured column sizing. main trick here is bootstrap's
		// column clases are tehdumb and must be the first in the list as
		// they use some of those pattern matching selectors. so strip out
		// all the old size classes, then put the new ones on the front of
		// whatever was leftover.

		self.el
		.removeClassEx(/^col/)
		.addClass(`${this.api.folderSizing} ${self.el.attr('class')}`);

		return;
	};

	fillWithProjects() {

		let self = this;

		self.projects.empty();

		for(const item of self.item.projects) {
			if(typeof item.path === 'undefined')
			continue;

			let project = new Project(
				self.api,
				item,
				self.id
			);

			self.projects
			.append(project.el);
		}

		return;
	};

	getIcon() {

		return 'codicon-root-folder';
	};

	handleReordering(ev) {

		const evHover = 'mouseover.reorder';
		const evLeave = 'mouseleave.reorder';
		const evMouseUp = 'mouseup.reorder';

		let self = this;
		let target = null;
		let dropzones = jQuery('#ProjectBox').find('.Folder, .Project');

		dropzones
		.on(evLeave, function(){
			target = jQuery('#ProjectBox');
			return false;
		})
		.on(evHover, function(){
			target = jQuery(this);
			return false;
		});

		jQuery('body')
		.addClass('ReorderFolder');

		jQuery(document)
		.on(evMouseUp, function(){

			jQuery(document)
			.off(evMouseUp);

			jQuery(self.api.elMain)
			.off(evHover);

			dropzones
			.off(evLeave)
			.off(evHover);

			jQuery('body')
			.removeClass('ReorderFolder');

			if(!target) {
				// destroy ghost probably
				return false;
			}

			let tid = target.attr('data-id');
			let pid = target.attr('data-parent') ?? null;

			////////

			if(target.hasClass('Folder')) {
				//target
				//.find('.Projects')
				//.append(self.el);

				self.api.send(new Message('projectmove', { id: self.id, before: tid }));

				return false;
			}

			if(target.hasClass('Project')) {
				//target.before(self.el);

				if(pid !== null)
				self.api.send(new Message('projectmove', { id: self.id, before: pid }));

				else
				self.api.send(new Message('projectmove', { id: self.id, before: tid }));

				return false;
			}

			//target.append(self.el);
			self.api.send(new Message('projectmove', { id: self.id, before: null, into: null }));

			return false;
		});

		return;
	};

};

class Project {
	constructor(api, item, parent=null) {
		this.id = item.id;
		this.api = api;
		this.item = item;
		this.parent = parent;
		this.el = this.api.template.project.clone();
		this.bindElements();
		this.prepareElements();
		return;
	};

	bindElements() {

		this.boxEntry = this.el.find('.ProjectEntry');
		this.textName = this.el.find('.Name');
		this.textIcon = this.el.find('.Icon i');
		this.textPath = this.el.find('.Path');
		this.btnDelete = this.el.find('.Delete');
		this.btnEdit = this.el.find('.Edit');
		this.btnReorder = this.el.find('.Reorder');
		this.btnMenu = this.el.find('.Config');

		return;
	};

	prepareElements() {

		let self = this;

		self.boxEntry
		.css('border-color', self.item.accent);

		self.textIcon
		.addClass(`${self.item.icon}`);

		self.textName
		.text(self.item.name);

		self.textPath
		.text(Dashboard.readableURI(self.item.path));

		self.btnDelete
		.on('click', function(){
			new ProjectDelete(self.api, self.item);
			return false;
		});

		self.btnEdit
		.on('click', function(){
			new ProjectConfig(self.api, self.item);
			return false;
		});

		self.btnReorder
		.on('mousedown.reorder', function(ev){
			self.handleReordering(ev);
			return false;
		});

		self.btnMenu
		.dropdown();

		self.el
		.removeClassEx(/^col/)
		.addClass(`${this.api.columnSizing} ${self.el.attr('class')}`)
		.on('click', function() {
			self.api.send(new Message(
				'projectopen',
				{ id: self.item.id }
			));
			return false;
		});

		return;
	};

	getIcon() {

		if(self.item.path.match(/^file:/))
		return 'codicon-folder';

		return 'codicon-remote-explorer';
	};

	handleReordering(ev) {

		const evHover = 'mouseover.reorder';
		const evLeave = 'mouseleave.reorder';
		const evMouseUp = 'mouseup.reorder';

		let self = this;
		let target = null;
		let dropzones = jQuery('#ProjectBox').find('.Folder, .Project');

		dropzones
		.on(evLeave, function(){
			target = jQuery('#ProjectBox');
			return false;
		})
		.on(evHover, function(){
			target = jQuery(this);
			return false;
		});

		jQuery('body')
		.addClass('ReorderProject');

		jQuery(document)
		.on(evMouseUp, function(){

			jQuery(document)
			.removeClass('ReorderProject')
			.off(evMouseUp);

			jQuery(self.api.elMain)
			.off(evHover);

			dropzones
			.off(evLeave)
			.off(evHover);

			jQuery('body')
			.removeClass('ReorderProject');

			if(!target) {
				// destroy ghost probably
				return false;
			}

			let tid = target.attr('data-id');
			let pid = target.attr('data-parent') ?? null;

			////////

			if(target.hasClass('Folder')) {
				//target
				//.find('.Projects')
				//.append(self.el);

				self.api.send(new Message('projectmove', { id: self.id, into: tid }));

				return false;
			}

			if(target.hasClass('Project')) {
				//target.before(self.el);

				self.api.send(new Message('projectmove', { id: self.id, before: tid, into: pid }));

				return false;
			}

			//target.append(self.el);
			self.api.send(new Message('projectmove', { id: self.id, before: null, into: null }));

			return false;
		});

		return;
	};

};

class ProjectConfig
extends TemplatedDialog {

	constructor(api, item) {
		super(api, '#TemplateProjectConfig');
		this.item = item;
		this.bindElements();
		this.bindAccentPreset();
		this.bindIconPreset();
		this.bindAcceptButton();
		this.bindCancelButton();
		this.fillConfigValues();
		this.show();
		return;
	};

	bindElements() {

		this.inputName = this.el.find('.Name');
		this.inputPath = this.el.find('.Path');
		this.inputAccent = this.el.find('.Accent');
		this.inputIcon = this.el.find('.Icon');

		this.binAccent = this.el.find('.AccentPresets > optgroup');
		this.binIcon = this.el.find('.IconPresets > optgroup');
		this.previewAccent = this.el.find('.AccentPreview');
		this.previewIcon = this.el.find('.IconPreview');

		this.btnAccept = this.el.find('.Save');
		this.btnCancel = this.el.find('.Cancel');

		return;
	};

	bindAcceptButton() {

		let self = this;

		self.btnAccept
		.on('click',function(){
			let id = self.item.id;
			let name = self.inputName.tval();
			let path = self.inputPath.tval();
			let accent = self.inputAccent.tval();
			let icon = self.inputIcon.tval();

			console.log({ id, name, path, accent, icon });

			self.api.send(new Message(
				'projectset',
				{ id, name, path, accent, icon }
			));

			self.destroy();
			return false;
		});

		return;
	};

	bindCancelButton() {

		this.btnCancel
		.on('click', this.hide.bind(this));

		return;
	};

	bindAccentPreset() {

		let self = this;

		(self.binAccent.parent())
		.on('change', function(){
			let colour = jQuery(this).val();

			self.inputAccent.val(colour);
			self.previewAccent.css('color', colour);

			return;
		});

		(self.inputAccent)
		.on('keyup', function(){
			let colour = self.inputAccent.val();
			self.binAccent.parent().val('');
			self.previewAccent.css('color', colour);
			return;
		});

		return;
	};

	bindIconPreset() {

		let self = this;

		this.binIcon.parent()
		.on('change', function(){
			let icon = jQuery(this).val();

			self.inputIcon.val(icon);
			self.previewIcon.find('i').removeClassEx(/^codicon-/);
			self.previewIcon.find('i').addClass(icon);

			return;
		});

		this.inputIcon
		.on('keyup', function(){
			let icon = self.inputIcon.val();
			self.binIcon.parent().val('');
			self.previewIcon.find('i').removeClassEx(/^codicon-/);
			self.previewIcon.find('i').addClass(icon);
			return;
		});

		return;
	};

	fillConfigValues() {

		let config = Dashboard.findProject(
			this.api.database,
			this.item.id
		);

		if(config === null) {
			console.log(`project config not found ${this.item.id}`);
			return;
		}

		this.inputName.val(config.name);
		this.inputPath.val(config.path);
		this.inputAccent.val(config.accent);
		this.inputIcon.val(config.icon);

		this.binAccent.empty();
		this.binIcon.empty();

		for(const colour in colours)
		this.binAccent.append(
			jQuery('<option />')
			.text(colour)
			.val(colours[colour])
			.css('color', colours[colour])
		);

		for(const icon in icons)
		this.binIcon.append(
			jQuery('<option />')
			.text(icon)
			.val(icons[icon])
		);

		return;
	};

	show() {

		this.inputAccent
		.trigger('keyup');

		this.inputIcon
		.trigger('keyup');

		super.show();

		return;
	};

};

class ProjectDelete
extends TemplatedDialog {

	constructor(api, item) {
		super(api, '#TemplateProjectDelete');
		this.item = item;
		this.bindElements();
		this.bindAcceptButton();
		this.bindCancelButton();
		this.fillConfigValues();
		this.show();
		return;
	};

	bindElements() {

		this.textName = this.el.find('.NamePreview');
		this.textIcon = this.el.find('.IconPreview');

		this.btnAccept = this.el.find('.Accept');
		this.btnCancel = this.el.find('.Cancel');

		return;
	};

	bindAcceptButton() {

		let self = this;

		this.btnAccept
		.on('click',function(){
			let id = self.item.id;

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

		this.btnCancel
		.on('click', this.hide.bind(this));

		return;
	};

	fillConfigValues() {

		this.textName.text(this.item.name);
		this.textIcon.addClass(this.item.icon);

		return;
	};
};

class ProjectNew
extends TemplatedDialog {

	constructor(api, parent=null) {
		super(api, '#TemplateProjectNew');
		this.parent = parent;
		this.bindElements();
		this.bindTypeSelector();
		this.bindSaveButton();
		this.bindFolderChooser();
		this.show();
		return;
	};

	bindElements() {

		this.typeSelector = this.el.find('.TypeSelector');
		this.inputName = this.el.find('.Name');
		this.inputSshUser = this.el.find('.ShellUser');
		this.inputSshHost = this.el.find('.ShellHost');
		this.inputSshPath = this.el.find('.ShellPath');
		this.inputPromode = this.el.find('.Promode');
		this.btnChooser = this.el.find('.Chooser');
		this.btnSave = this.el.find('.Save');

		return;
	};

	bindTypeSelector() {

		let self = this;

		this.typeSelector
		.find('.btn')
		.on('click', function(){

			let that = jQuery(this);
			let type = that.attr('data-type');

			// dedcide which button is lit.

			self.typeSelector
			.find('.btn')
			.addClass('btn-dark')
			.removeClass('btn-primary');

			that
			.addClass('btn-primary')
			.removeClass('btn-dark');

			// display the selected type input form.

			(self.el.find('.TypeNewForm'))
			.addClass('d-none');

			(self.el.find(that.attr('data-show')))
			.removeClass('d-none');

			// allow progress when type is selected and make note of.

			(self.el.find('footer'))
			.removeClass('d-none');

			self.typeSelector
			.attr('data-selected', type);

			// reset the file chooser.

			self.setDirectory(null);

			return;
		});

		return;
	};

	bindSaveButton() {

		let self = this;

		this.btnSave
		.on('click',function(){

			let type = self.typeSelector.attr('data-selected');
			let name = self.inputName.tval();
			let uri = null;
			let parent = self.parent;

			switch(type) {
				case 'local':
					uri = jQuery.trim(self.btnChooser.attr('data-uri'));
				break;
				case 'ssh':
					let host = self.inputSshHost.tval();
					let user = self.inputSshUser.tval();
					let path = self.inputSshPath.tval();
					uri = `vscode-remote://ssh-remote+${user}@${host}${path}`;
				break;
				case 'promode':
					uri = self.inputPromode.tval();
				break;
			}

			if(uri === null || uri === '')
			return;

			(self.el.find('.Close'))
			.trigger('click');

			self.api.send(new Message('projectnew', { name, uri, parent }));
			return;
		});

		return;
	};

	bindFolderChooser() {

		let self = this;

		jQuery(document)
		.on('dirpick', function(ev, data){
			self.setDirectory(data);
			return;
		});

		self.btnChooser
		.on('click', function(){
			self.api.send(new Message('pickdir'));
			return;
		});

		return;
	};

	setDirectory(input) {

		if(input === null) {
			this.btnChooser
			.removeClass('cased')
			.text(this.btnChooser.attr('data-default'))
			.attr('data-uri', '');

			return;
		}

		this.btnChooser
		.addClass('cased')
		.text(input.label)
		.attr('data-uri', input.uri);

		return;
	};

	show() {

		this.setDirectory(null);
		this.inputName.val('');
		this.inputSshHost.val('');
		this.inputSshUser.val('');
		this.inputSshPath.val('');
		this.inputPromode.val('');

		super.show();
		return;
	};
};

class FolderNew
extends TemplatedDialog {

	constructor(api) {
		super(api, '#TemplateFolderNew');
		this.bindElements();
		this.bindSaveButton();
		this.show();
		return;
	};

	bindElements() {
		this.inputName = this.el.find('.Name');
		this.btnSave = this.el.find('.Save');
		return;
	};

	bindSaveButton() {

		let self = this;

		this.btnSave
		.on('click', function(){

			let name = self.inputName.tval();

			if(name === null || name === '')
			return;

			(self.el.find('.Close'))
			.trigger('click');

			self.api.send(new Message('foldernew', { name }));
			return;
		});

		return;
	};

	show() {

		this.inputName.val('');

		super.show();
		return;
	};
};

class DashboardConfig
extends TemplatedDialog {

	constructor(api,) {
		super(api, '#TemplateDashboardConfig');
		this.bindElements();
		this.bindPresetButtons();
		this.bindAcceptButton();
		this.bindCancelButton();
		this.show();
		return;
	};

	bindElements() {

		this.inputTitle = this.el.find('.Title');
		this.inputFolderSizing = this.el.find('.FolderSizing');
		this.inputColumnSizing = this.el.find('.ColumnSizing');

		this.btnFolderSizingPresets = this.el.find('.DashboardFolderPreset');
		this.btnColumnSizingPresets = this.el.find('.DashboardColumnPreset');
		this.btnAccept = this.el.find('.Save');
		this.btnCancel = this.el.find('.Cancel');

		return;
	};

	bindPresetButtons() {

		let self = this;

		self.btnFolderSizingPresets
		.on('click', function(){

			let that = jQuery(this);
			let value = that.attr('data-value');

			self.inputFolderSizing
			.val(value);

			return;
		});

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
				folderSizing: self.inputFolderSizing.tval(),
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
		this.inputFolderSizing.val(this.api.folderSizing);
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

class Dashboard {

	elMain = null;
	elMessageDebug = null;
	elToolbar = null;
	elProjectBox = null;
	body = null;
	template = {};

	// official config values.

	database = null;
	title = 'Dashboard';
	debug = false;
	database = [];
	folderSizing = 'col-12';
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

		this.template.folder = (
			(this.elProjectBox)
			.find('.FolderTemplate')
			.remove()
			.clone()
			.removeClass('d-none')
			.removeClass('FolderTemplate')
		);

		this.template.project = (
			(this.elProjectBox)
			.find('.ProjectTemplate')
			.remove()
			.clone()
			.removeClass('d-none')
			.removeClass('ProjectTemplate')
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

		for(const item of this.database) {
			if(typeof item.path === 'undefined')
			this.elProjectBox.append((new Folder(this, item)).el);
			else
			this.elProjectBox.append((new Project(this, item)).el);
		}

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

		return this;
	};

	prepareUI() {

		let self = this;

		jQuery('.CmdProjectNew')
		.on('click', function(){
			new ProjectNew(self);
			return;
		});

		jQuery('.CmdFolderNew')
		.on('click', function(){
			new FolderNew(self);
			return;
		});

		jQuery('.CmdDashboardConfig')
		.on('click', function(){
			new DashboardConfig(self);
			return;
		});

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

		jQuery(document)
		.trigger('dirpick', msg.data);

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	static readableURI(input) {

		if(input.match(/^file:/)) {
			let output = decodeURIComponent(input.replace(/^file:\/\/\/?/,''));

			if(navigator.platform.match(/^Win/))
			output = output.replace(/\//g,'\\');

			return output;
		}

		if(input.match(/^vscode-remote:/))
		return input.replace(/vscode-remote:\/\/(?:[a-z0-9\-]*\+)?/,'');

		return input;
	};

	static arrayFindById(input, whatYouSeek) {

		for(const item of input)
		if(typeof item.id !== 'undefined')
		if(item.id === whatYouSeek)
		return item;

		return null;
	};

	static findProject(input, whatYouSeek) {

		for(const item of input) {
			if(item.id === whatYouSeek)
			return item;

			if(typeof item.projects !== 'undefined') {
				let sub = Dashboard.findProject(
					item.projects,
					whatYouSeek
				);

				if(sub !== null)
				return sub;
			}
		}

		return null;
	};

};

jQuery(document)
.ready(function(){
	new Dashboard;
	return;
});
