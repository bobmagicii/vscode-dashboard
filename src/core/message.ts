import * as vscode from 'vscode';

class Message {

	type:
	string|null = null;

	data:
	any|null = null;

	constructor(type: string, data: any|null=null) {

		this.type = type;
		this.data = data;

		return;
	};

	static FromObject(input: { type: string, data: any }):
	Message {

		let type = 'unknown';
		let data = null;

		if(typeof input.type === 'string')
		type = input.type;

		if(typeof input.data === 'object')
		data = input.data;

		return new Message(type, data);
	};

};

export default Message;
