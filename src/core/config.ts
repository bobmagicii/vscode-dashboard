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
	folderSizing: string;
	columnSizing: string;
	tabMode: boolean;
	showPath: boolean;

	private keepers:
	Array<string> = [
		'title', 'debug', 'database', 'folderSizing', 'columnSizing',
		'tabMode', 'showPath'
	];

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	constructor() {

		this.api = vscode.workspace.getConfiguration('projectsyeah');

		this.title = 'Dashboard';
		this.debug = false;
		this.database = [];
		this.folderSizing = 'col-12';
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

	public addFolder(name: string):
	void {

		(this.database)
		.push(new ProjectFolder({
			id: uuid.v4(),
			name: name
		}));

		this.save();

		return;
	};

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

		this.findProject(id, true);
		this.save();

		return;
	};

	public updateProject(id: string, data: any):
	void {

		const item = this.findProject(id);

		if(item !== null) {
			item.update(data);
			this.save();
		}

		return;
	};

	public moveProject(id: string, into: string|null, before: string|null):
	void {

		let database: Array<any>|null = null;
		let found = this.findProject(id, true);

		if(found === null)
		return Util.println(
			`project ${id} not found`,
			'Config::moveProject'
		);

		// then insert it back into the dataset in its final resting place.
		// first decide if its going into a folder or not.

		database = this.database;

		if(into !== null) {
			let folder = Util.findInArrayById(this.database, into);

			if(folder instanceof ProjectFolder)
			database = folder.projects;

			else
			return Util.println(
				`folder ${into} not found`,
				'Config::moveProject'
			);
		}

		if(!Array.isArray(database))
		return Util.println(
			'nothing happened',
			'Config::moveProject'
		);

		// then determine if it needs to go into a specific spot into the
		// the final dataset.

		let key: any = 0;
		let inset: boolean = false;

		if(before !== null) {
			for(key in database) {
				if(database[key].id === before) {
					inset = true;
					break;
				}
			}
		}

		if(inset)
		Util.println(
			`insert before ${before}`,
			'Config::moveProject'
		);

		Util.println(
			`seating project in slot ${key}`,
			'Config::moveProject'
		);

		// and do it mang.

		database.splice(key, 0, found);
		this.save();

		return;
	};

	public findProject(id: string, removeAsWell: boolean = false):
	ProjectFolder|ProjectEntry|null {

		let found: ProjectFolder|ProjectEntry|null = null;

		// note: the remove operation does not commit a save, this is
		// intentional.

		for(const item of this.database) {
			if(item.id === id) {
				found = item;

				if(removeAsWell)
				this.database = Util.filterArrayStripById(
					this.database,
					id
				);

				break;
			}

			if(item instanceof ProjectFolder)
			if(found = Util.findInArrayById(item.projects, id)) {

				if(removeAsWell)
				item.projects = Util.filterArrayStripById(
					item.projects,
					id
				);

				break;
			}
		}

		return found;
	};

};

export default Config;
