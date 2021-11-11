
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
	elProjectBox = null;

	database = null;
	template = null;

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
		this.elMain = jQuery('#Dashboard')
		this.elProjectBox = jQuery('#ProjectBox');
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

		(this.vscode)
		.postMessage(new Message('hey'));

		return;
	};

	render() {

		if(!this.database)
		return;

		this.elProjectBox.empty();

		for(const item of this.database) {
			let entry = this.template.clone();

			entry.find('.Icon i').addClass(`codicon-${item.icon}`);
			entry.find('.Name').text(item.name);
			entry.find('.Path').text(item.path);

			(this.elProjectBox)
			.append(entry);
		}

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
		}

		return;
	};

	onHeySup(msg) {

		this.database = msg.data.database;
		this.setDebug(msg.data.debug);

		if(this.debug)
		this.debugMessage(msg);

		this.render();
		return;
	};

};

jQuery(document)
.ready(function(){
	new Dashboard;
	return;
});
