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

};

export default Message;
