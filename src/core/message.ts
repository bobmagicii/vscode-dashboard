import * as vscode from 'vscode';

class Message {

	type:
	string|null = null;

	data:
	object|null = null;

	constructor(type: string, data: object|null=null) {

		this.type = type;
		this.data = data;

		return;
	};

	static FromObject(input: { type: string, data: object }):
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
