import * as vscode from 'vscode';
import ProjectEntry from "./project-entry";
import Util from './util';

class Config {

	api: vscode.WorkspaceConfiguration;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	title: string;
	debug: boolean;
	database: Array<ProjectEntry>;
	columnSizing: string;
	tabMode: boolean;
	showPath: boolean;

	private keepers:
	Array<string> = [
		'title', 'debug', 'database', 'columnSizing', 'tabMode',
		'showPath'
	];

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	constructor() {

		this.api = vscode.workspace.getConfiguration('projectsyeah');

		this.title = 'Projects';
		this.debug = false;
		this.database = [];
		this.columnSizing = 'col-12 col-sm-6 col-md-4 col-lg-3';
		this.tabMode = true;
		this.showPath = true;

		this.fillFromEditorConfig();
		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public fillFromEditorConfig():
	void {

		for(const key of this.keepers) {
			if(key === 'database')
			continue;

			if(!this.api.has(key))
			continue;

			this[key as keyof this] = this.api.get(key) as typeof this[keyof this];
		}

		for(const item of this.api.database)
		this.database.push(ProjectEntry.FromObject(item));

		return;
	};

	public save():
	void {

		// only write the keys that have been configured in the
		// extension settings as not all configuration options are
		// exposed via the ui yet.

		for(const key of this.keepers)
		if(this.api.has(key))
		this.api.update(key, this[key as keyof this], true);

		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public addProject(name: string, uri: string):
	void {

		(this.database)
		.push(new ProjectEntry(
			name,
			uri
		));

		this.save();

		return;
	};

	public removeProject(id: string):
	void {

		this.database = Util.filterArrayStripById(
			this.database,
			id
		);

		this.save();

		return;
	};

};

export default Config;
