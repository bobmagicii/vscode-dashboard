import * as vscode from 'vscode';
import * as uuid from 'uuid';

import ProjectEntry from "./project-entry";
import Util from './util';
import ProjectFolder from './project-folder';

class Config {

	api: vscode.WorkspaceConfiguration;

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	title: string;
	debug: boolean;
	database: Array<ProjectEntry|ProjectFolder>;
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
		this.columnSizing = 'col-12 col-md-6';
		this.tabMode = true;
		this.showPath = true;

		this.fillFromEditorConfig();
		return;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	public fillFromEditorConfig():
	void {

		let self = this;

		// in this instance this self is quite specific because vsocde would
		// claim everything was fine, but manually running the compiler
		// bombed saying cannot find name this. even though for a while it
		// was working. but then this alias hack... whatever my dudes.

		for(const key of this.keepers) {
			if(key === 'database')
			continue;

			if(!this.api.has(key))
			continue;

			this[key as keyof this] = this.api.get(key) as (typeof self[(keyof this)]);
		}

		for(const item of this.api.database)
		if(typeof item.path === 'undefined')
		this.database.push(new ProjectFolder(item));
		else
		this.database.push(new ProjectEntry(item));

		return;
	};

	getMap():
	Map<string, any> {

		let output = new Map<string, any>();

		for(const key of this.keepers) {
			if(key === 'database')
			output.set(key, this.database.map((v)=> v));
			else
			output.set(key, this[key as keyof this]);
		}

		return output;
	};

	getObject():
	object {

		let output: any = {};

		for(const key of this.keepers) {
			if(key === 'database')
			output[key] = this.database.map((v)=> v);
			else
			output[key] = this[key as keyof this];
		}

		return output;
	};

	setObject(input: any):
	void {

		for(const key in input)
		if(this.keepers.indexOf(key) >= 0)
		this[key as keyof this] = input[key];

		this.save();

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

	public addProject(name: string, path: string):
	void {

		(this.database)
		.push(new ProjectEntry({
			id: uuid.v4(),
			name: name,
			path: path,
			accent: null,
			icon: null
		}));

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

	public updateProject(id: string, data: any):
	void {

		for(const item of this.database)
		if(item.id === id) {
			item.update(data);
			break;
		}

		this.save();

		return;
	};

};

export default Config;
