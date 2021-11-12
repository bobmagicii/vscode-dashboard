import * as vscode from 'vscode';
import ProjectEntry from "./project-entry";
import Util from './util';

class Config {

	api: vscode.WorkspaceConfiguration;

	title: string;
	debug: boolean;
	database: Array<ProjectEntry>;
	columnSizing: string;

	private keepers: Array<string> = [
		'title',
		'debug',
		'database',
		'columnSizing'
	];

	constructor() {

		this.api = vscode.workspace.getConfiguration('projectsyeah');

		this.title = 'Projects';
		this.debug = false;
		this.database = [];
		this.columnSizing = 'col-12 col-sm-6 col-md-4 col-lg-3';

		this.fillFromEditorConfig();
		return;
	};

	public fillFromEditorConfig():
	void {



		////////

		this.title = this.api.title;
		this.debug = this.api.debug;
		this.columnSizing = this.api.columnSizing;

		for(const item of this.api.database)
		this.database.push(ProjectEntry.FromObject(item));

		return;
	};

	public save():
	void {

		for(const key of this.keepers)
		this.api.update(key, this[key as keyof typeof this], true);

		return;
	}

};

export default Config;
