import * as vscode from 'vscode';

import Util from './util';

class ProjectEntry {

	public id: string;
	public icon: string;
	public name: string;
	public path: string;
	public background: string;
	public accent: string;

	constructor(name: string, path: string) {

		this.id = path;
		this.name = name;
		this.path = path;
		this.icon = this.getIcon();
		this.background = 'var(--DashboardProjectBg);';
		this.accent = 'var(--DashboardProjectAccent);';

		return;
	};

	public getIcon():
	string {

		if(this.path.match(/@/))
		return 'remote-explorer';

		return 'folder';
	};

	public getUriObject():
	vscode.Uri {

		// local filepaths can just be their path.
		// ssh tho, vscode-remote://ssh-remote+USER@HOST/PATH

		if(this.path.match(/:\/\//))
		return vscode.Uri.parse(this.path, true);

		return vscode.Uri.file(this.path);
	}

	static FromObject(input: { name: string, path: string }):
	ProjectEntry {

		return new ProjectEntry(
			input.name,
			input.path
		);
	};

};

export default ProjectEntry;
