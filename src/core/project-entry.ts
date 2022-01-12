import * as vscode from 'vscode';
import Util from './util';

type ProjectEntryArgv = {
	id: string,
	name: string
	path: string,
	accent: string|null,
	icon: string|null
};

class ProjectEntry {

	public id: string;
	public icon: string;
	public name: string;
	public path: string;
	public accent: string;

	constructor(input: ProjectEntryArgv) {

		this.id = input.id;
		this.name = input.name;
		this.path = input.path;
		this.icon = input.icon ?? this.getIcon();
		this.accent = input.accent ?? '#dc143c';

		return;
	};

	public getIcon():
	string {

		if(this.path.match(/@/))
		return 'codicon-remote-explorer';

		return 'codicon-folder';
	};

	public getUriObject():
	vscode.Uri {

		// local filepaths can just be their path.
		// ssh tho, vscode-remote://ssh-remote+USER@HOST/PATH

		if(this.path.match(/:\/\//))
		return vscode.Uri.parse(this.path, true);

		return vscode.Uri.file(this.path);
	};

	public update(input: any):
	this {

		if(typeof input.id !== 'undefined')
		this.id = input.id;

		if(typeof input.name !== 'undefined')
		this.name = input.name;

		if(typeof input.path !== 'undefined')
		this.path = input.path;

		if(typeof input.accent !== 'undefined')
		this.accent = input.accent;

		if(typeof input.icon !== 'undefined')
		this.icon = input.icon;

		return this;
	};

};

export default ProjectEntry;
