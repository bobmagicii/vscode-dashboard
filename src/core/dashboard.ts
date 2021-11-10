import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import Util from './util';
import Message from './message';

class Dashboard {

	private panel:
	vscode.WebviewPanel|undefined;

	private ext:
	vscode.ExtensionContext;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public constructor(ext: vscode.ExtensionContext) {

		this.ext = ext;

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

		let filename = path.join(
			this.ext.extensionPath, 'local', 'html', 'main.html'
		);

		let tokens = {
			"%CSPSOURCE%": this.panel?.webview.cspSource,
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

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public onClosed():
	void {

		Util.println('Dashboard Closed');
		delete this.panel;

		return;
	};

	public onMessage(input: object):
	void {

		Util.println(
			JSON.stringify(input),
			'Dashboard::onMessage'
		);

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