import * as vscode from 'vscode';

import Util from './core/util';
import Dashboard from './core/dashboard';

export function activate(context: vscode.ExtensionContext) {
	Util.println('Activating Dashboard...');

	let dash = new Dashboard(context);
	dash.open();

	Util.println('Dashboard Activated.');
	dash.sendv('hey');

	return;
};

export function deactivate() {

	return;
};
