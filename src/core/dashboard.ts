import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import Util from './util';
import Config from './config';
import Message from './message';
import ProjectEntry from './project-entry';

class Dashboard {

	private panel:
	vscode.WebviewPanel|undefined;

	private ext:
	vscode.ExtensionContext;

	private conf:
	Config;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public constructor(ext: vscode.ExtensionContext) {

		this.ext = ext;
		this.conf = new Config;

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public open():
	void {

		if(this.panel) {
			Util.println('TODO: switch to existing dashboard tab.');
			return;
		}

		this.panel = vscode.window.createWebviewPanel(
			'projectdash',
			'Projects',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(this.ext.extensionPath)
				]
			}
		);

		(this.panel)
		.onDidDispose(this.onClosed.bind(this));

		(this.panel.webview)
		.onDidReceiveMessage(this.onMessage.bind(this));

		(this.panel.webview)
		.html = this.generateContent();

		return;
	};

	public send(msg: Message):
	void {

		if(!this.panel)
		return;

		(this.panel.webview)
		.postMessage(msg);

		return;
	};

	public sendv(type: string, data: object|null=null):
	void {

		if(!this.panel)
		return;

		let msg = new Message(type, data);
		Util.println(
			JSON.stringify(msg),
			'Dashboard::sendv'
		);

		(this.panel.webview)
		.postMessage(msg);

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public generateContent():
	string {

		if(!this.panel)
		return '';

		let filename = path.join(
			this.ext.extensionPath, 'local', 'html', 'main.html'
		);

		let tokens = {
			"%CSPSOURCE%": this.panel.webview.cspSource,
			"%NMROOT%": this.localToWebpath(path.join(
				this.ext.extensionPath, 'node_modules'
			)),
			"%CSSROOT%": this.localToWebpath(path.join(
				this.ext.extensionPath, 'local', 'css'
			)),
			"%JSROOT%": this.localToWebpath(path.join(
				this.ext.extensionPath, 'local', 'js'
			)),
			"%IMGROOT%": this.localToWebpath(path.join(
				this.ext.extensionPath, 'local', 'img'
			))
		};

		let content = (
			fs
			.readFileSync(filename)
			.toString()
		);

		////////

		for(const token in tokens)
		content = content.replace(
			(new RegExp(token,'g')),
			tokens[token as keyof typeof tokens]
		);

		////////

		return content;
	};

	public generateDatabase():
	object {


		return {

		};
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public onClosed():
	void {

		Util.println('Dashboard Closed');
		delete this.panel;

		return;
	};

	public onMessage(input: {type: string, data: object}):
	void {

		let msg = Message.FromObject(input);

		if(this.conf.debug)
		Util.println(
			JSON.stringify(msg),
			'Dashboard::onMessage'
		);

		switch(msg.type) {
			case 'hey':
				this.sendv('sup', {
					debug: this.conf.debug,
					database: this.conf.database
				});
			break;
		}

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public localToWebpath(filename: string):
	string {

		if(!this.panel)
		return '';

		return (
			this.panel.webview
			.asWebviewUri(vscode.Uri.file(filename))
			.toString()
		);
	};

};

export default Dashboard;