
class Message {

	type = null;
	data = null;

	constructor(type, data) {
		this.type = type;
		this.data = data;
		return;
	};

};

class Dashboard {

	debug = true;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	onMessageBinding = null;
	element = null;
	elMessageDebug = null;

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
		this.onMessageBinding = this.onMessage.bind(this);
		this.element = document.getElementById('Dashboard');
		this.elMessageDebug = document.getElementById('MessageDebug');

		window.addEventListener(
			'message',
			this.onMessageBinding
		);

		if(this.debug) {
			(this.elMessageDebug.classList)
			.remove('d-none');
		}

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	onMessage(ev) {

		let msg = new Message(ev.data.type, ev.data.data);

		if(this.debug)
		this.elMessageDebug.innerHTML = JSON.stringify(msg, null, "\t");

		switch(msg.type) {
			case 'hey': this.onHey(); break;
			case 'render': this.onRender(msg); break;
		}

		return;
	};

	onHey() {

		let msg = new Message('sup', null);
		this.vscode.postMessage(msg);

		return;
	};

	onRender(msg) {

		(this.element)
		.innerHTML = JSON.stringify(msg.data);

		return;
	};

};

document.addEventListener(
	'DOMContentLoaded',
	function(Ev){
		new Dashboard;
		return;
	}
);
