import * as vscode from 'vscode';

import ProjectEntry from './project-entry';
import Util from './util';

type ProjectFolderArgv = {
	id: string,
	name: string,
	accent: string|null,
	icon: string|null,
	open: boolean,
	projects: Array<ProjectEntry>
};

class ProjectFolder {

	public id: string;
	public name: string;
	public accent: string;
	public icon: string;
	public open: boolean;
	public projects: Array<ProjectEntry>;

	constructor(input: ProjectFolderArgv) {

		this.id = input.id;
		this.name = input.name;
		this.icon = input.icon ?? this.getIcon();
		this.accent = input.accent ?? 'var(--DashboardProjectAccent)';
		this.open = input.open ?? false;
		this.projects = input.projects.length ? input.projects.map(((v)=> new ProjectEntry(v))) : [];

		return;
	};

	public getIcon():
	string {

		return 'codicon-folder';
	};

	public update(input: any):
	typeof this {

		if(typeof input.id !== 'undefined')
		this.id = input.id;

		if(typeof input.name !== 'undefined')
		this.name = input.name;

		if(typeof input.accent !== 'undefined')
		this.accent = input.accent;

		if(typeof input.icon !== 'undefined')
		this.icon = input.icon;

		if(typeof input.open !== 'undefined')
		this.open = input.open;

		return this;
	};

};

export default ProjectFolder;
