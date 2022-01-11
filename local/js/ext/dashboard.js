import Folder from './folder.js';
import Project from './project.js';
import Message from './message.js';
import ProjectNew from './project-new.js';
import FolderNew from './folder-new.js';
import DashboardConfig from './dashboard-config.js';

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
	showPaths = true;
	openOnNewWindow = true;

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

export default Dashboard;
