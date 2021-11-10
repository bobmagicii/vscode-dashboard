import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import Util from './util';

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

				enableScripts: true
				//localResourceRoots: [
				//	vscode.Uri.file(this.ext.extensionPath)
				//]
			}
		);

		(this.panel)
		.onDidDispose(this.onClosed.bind(this));

		this.panel.webview.html = this.generateContent();

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
			"%CSSROOT%": this.localToWebpath(path.join(
				this.ext.extensionPath, 'local', 'css'
			)),
			"%JSROOT%": this.localToWebpath(path.join(
				this.ext.extensionPath, 'local', 'js'
			))
		};

		let content = fs.readFileSync(filename).toString();

		////////

		for(const token in tokens)
		while(content.match(token))
		content = content.replace(
			token,
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