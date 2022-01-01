import * as vscode from 'vscode';

import Util from './core/util';
import Dashboard from './core/dashboard';
import Sidebar from './core/sidebar';

export function activate(context: vscode.ExtensionContext) {
	Util.println('Activating Dashboard');

	new Sidebar(new Dashboard(context));

	Util.println('Dashboard Activated');
	return;
};

export function deactivate() {

	return;
};
