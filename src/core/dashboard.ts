import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import Util from './util';
import Config from './config';
import Message from './message';
import ProjectEntry from './project-entry';

class Dashboard {

	public panel:
	vscode.WebviewPanel|undefined;

	public ext:
	vscode.ExtensionContext;

	public conf:
	Config;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public constructor(ext: vscode.ExtensionContext) {

		this.ext = ext;
		this.conf = new Config;

		this.open();

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public open():
	void {

		if(this.panel) {
			this.panel.reveal();
			return;
		}

		this.panel = vscode.window.createWebviewPanel(
			'projectsyeah-dashboard-main',
			'Projects',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(this.ext.extensionPath)
				]
			}
		);

		this.panel.iconPath = vscode.Uri.file(path.join(
			this.ext.extensionPath, 'local', 'gfx', 'icon.svg'
		));

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
			"%COLUMNSIZING%":
			this.conf.columnSizing,

			"%CSPSOURCE%":
			this.panel.webview.cspSource,

			"%NMROOT%":
			this.localToWebpath(path.join(
				this.ext.extensionPath, 'node_modules'
			)),

			"%CSSROOT%":
			this.localToWebpath(path.join(
				this.ext.extensionPath, 'local', 'css'
			)),

			"%JSROOT%":
			this.localToWebpath(path.join(
				this.ext.extensionPath, 'local', 'js'
			)),

			"%IMGROOT%":
			this.localToWebpath(path.join(
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

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

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
				this.onHey(msg);
			break;
			case 'open':
				this.onOpen(msg);
			break;
			case 'pickdir':
				this.onPickDir(msg);
			break;
			case 'projectnew':
				this.onProjectNew(msg);
			break;
			case 'projectdel':
				this.onProjectDel(msg);
			break;
			case 'configset':
				this.onConfigSet(msg);
			break;
		}

		return;
	};

	public onHey(msg: Message):
	void {

		this.sendv('sup', this.conf.getObject());

		return;
	};

	public onOpen(msg: Message):
	void {

		for(const project of this.conf.database)
		if(project.id === msg.data.id) {
			Util.println(
				`open ${msg.data.id}`,
				'Dashboard::onOpen'
			);

			vscode.commands.executeCommand(
				'vscode.openFolder',
				project.getUriObject()
			);

			return;
		}

		return;
	};

	public onPickDir(msg: Message):
	void {

		let self = this;

		(vscode.window)
		.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false
		})
		.then(function(Selected: vscode.Uri[] | undefined){

			if(typeof Selected === 'undefined')
			return;

			if(typeof Selected[0] === 'undefined')
			return;

			self.sendv('dirpick',{
				label: Selected[0].fsPath,
				uri: Selected[0].toString()
			});

			return;
		});

		return;
	};

	public onProjectNew(msg: Message):
	void {

		this.conf.addProject(
			msg.data.name,
			msg.data.uri
		);

		this.onHey(msg);

		return;
	};

	public onProjectDel(msg: Message):
	void {

		this.conf.removeProject(msg.data.id);

		this.onHey(msg);

		return;
	};

	public onConfigSet(msg: Message):
	void {

		this.conf.setObject(msg.data);

		this.onHey(msg);

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