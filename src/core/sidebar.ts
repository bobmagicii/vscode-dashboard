import * as vscode from 'vscode';

import Dashboard from './dashboard';
import Util from './util';

class Sidebar
implements vscode.WebviewViewProvider {

	public id: string = "dashyeah-dashboard-sidebar";

	protected api: Dashboard;
	protected view: vscode.WebviewView | undefined;
	protected ctx: vscode.WebviewViewResolveContext | undefined;
	protected token: vscode.CancellationToken | undefined;

	constructor(api: Dashboard) {
		this.api = api;

		this.api.ext.subscriptions
		.push(vscode.window.registerWebviewViewProvider(
			this.id,
			this
		));

		return;
	}

	resolveWebviewView(view: vscode.WebviewView, ctx: vscode.WebviewViewResolveContext, token: vscode.CancellationToken):
	void | Thenable<void> {

		this.view = view;
		this.ctx = ctx;
		this.token = token;

		(this.view)
		.onDidChangeVisibility(this.open.bind(this));

		this.view.webview.html = `
			TODO: Sidebar Mode
		`;

		this.open();
		return;
	};

	onChange() {

		this.api.open();
		return;
	};

	open() {
		if(typeof this.view === 'undefined')
		return;

		if(this.api.conf.tabMode) {
			vscode.commands.executeCommand("workbench.view.explorer");
			this.api.open();
		}

		// else, just let it open in the sidebar.

		return;
	}
};

export default Sidebar;
