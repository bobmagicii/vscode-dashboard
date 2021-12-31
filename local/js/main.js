
class Message {

	type = null;
	data = null;

	constructor(type, data=null) {
		this.type = type;
		this.data = data;
		return;
	};

};

class Dashboard {

	debug = false;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	elMain = null;
	elMessageDebug = null;
	elToolbar = null;
	elProjectBox = null;
	body = null;
	template = null;

	database = null;
	title = 'Dashboard';

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
		this.prepareDialogs();

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

		////////

		this.elProjectBox.empty();

		for(const item of this.database) {
			let entry = this.template.clone();

			entry.find('.Icon i')
			.addClass(`codicon-${item.icon}`);

			entry.find('.Name')
			.text(item.name);

			entry.find('.Path')
			.text(item.path);

			// clicking the delete button

			entry.find('.Delete')
			.on('click', function(){

				// @todo 2021-12-31
				// confirm dialog before really doing it. cannot use
				// the old confirm() method in this context apparently.

				self.send(new Message(
					'projectdel',
					{ id: item.id }
				));

				entry.empty();
				entry.remove();

				return false;
			});

			// clicking the main button will open the project.

			entry
			.attr('data-id', item.id)
			.attr('data-path-uri', item.path)
			.on('click', function(){
				self.onProjectClick(jQuery(this));
				return false;
			});

			(this.elProjectBox)
			.append(entry);
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

		console.log(`[Dashboard] debug set to: ${this.debug}`);
		return this;
	};

	prepareDialogs() {

		jQuery('.Dialog .Close')
		.on('click', function(){

			jQuery('.Dialog')
			.addClass('d-none');

			jQuery('#Overlay')
			.addClass('d-none');

			return;
		});

		this.prepareDialogProjectNew();

		return;
	};

	prepareDialogProjectNew() {

		let self = this;

		// rig up the selector.

		jQuery('#ProjectNewType .btn')
		.on('click', function(){

			let that = jQuery(this);
			let selector = that.parent();
			let type = that.attr('data-type');
			let form = null;

			selector
			.find('.btn')
			.addClass('btn-dark')
			.removeClass('btn-primary');

			that
			.addClass('btn-primary')
			.removeClass('btn-dark');

			jQuery('.ProjectNewForm')
			.addClass('d-none');

			jQuery(that.attr('data-show'))
			.removeClass('d-none')

			jQuery('#DialogProjectNew')
			.find('footer')
			.removeClass('d-none');

			jQuery('#ProjectNewType')
			.attr('data-selected', type);

			return;
		});

		// rig up the save button.
		jQuery('#ProjectNewSave')
		.on('click',function(){

			let type = jQuery('#ProjectNewType').attr('data-selected');
			let name = jQuery.trim(jQuery('#ProjectNewName').val());
			let uri = null;

			switch(type) {
				case 'local':
					uri = jQuery.trim(
						jQuery('#ProjectFolderChoose')
						.attr('data-uri')
					);
				break;
				case 'ssh':
					let user = jQuery.trim(jQuery('#ProjectNewSshUser').val());
					let host = jQuery.trim(jQuery('#ProjectNewSshHost').val());
					let path = jQuery.trim(jQuery('#ProjectNewSshPath').val());
					uri = `vscode-remote://ssh-remote+${user}@${host}${path}`;
				break;
				case 'promode':
					uri = jQuery.trim(
						jQuery('#ProjectNewPromodeEntry')
						.val()
					);
				break;
			}

			if(uri === null)
			return;

			self.send(new Message('projectnew', { name, uri }));
			return;
		});

		// rig up the folder chooser.

		jQuery('#ProjectFolderChoose')
		.on('click', function(){

			self.send(new Message('pickdir'));
			return;
		});

		return;
	};

	prepareUI() {

		jQuery('.CmdProjectNew')
		.on('click',function(){

			jQuery('#DialogProjectNew, #Overlay')
			.removeClass('d-none');

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

		this.database = msg.data.database;
		this.title = msg.data.title;
		this.setDebug(msg.data.debug);

		if(this.debug)
		this.debugMessage(msg);

		this.render();
		return;
	};

	onDirPicked(msg) {

		jQuery('#ProjectFolderChoose')
		.addClass('cased')
		.text(msg.data.label)
		.attr('data-uri', msg.data.uri);

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	onProjectClick(Item) {

		let goto = Item.attr('data-path-uri');

		this.send(new Message('open', { goto }));

		return;
	};

};

jQuery(document)
.ready(function(){
	new Dashboard;
	return;
});
