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
	showPaths: boolean;
	openOnNewWindow: boolean;
	fontSize: string;
	rounded: boolean;

	private keepers:
	Array<string> = [
		'title', 'debug', 'database', 'folderSizing', 'columnSizing',
		'tabMode', 'showPaths', 'openOnNewWindow', 'fontSize', 'rounded'
	];

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	constructor() {

		this.api = vscode.workspace.getConfiguration('dashyeah');

		this.title = 'Dashboard';
		this.debug = false;
		this.database = [];
		this.folderSizing = 'col-12';
		this.columnSizing = 'col-12 col-md-6';
		this.tabMode = true;
		this.showPaths = true;
		this.openOnNewWindow = true;
		this.fontSize = 'font-size-normal';
		this.rounded = true;

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

	public getMap():
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

	public getObject():
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

	public setObject(input: any):
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

		let project = new ProjectFolder({
			id: uuid.v4(),
			name: name
		});

		project.open = true;

		this.database.push(project);
		this.save();
		return;
	};

	public addProject(name: string, path: string, parent: string|null):
	void {

		let database = this.database;
		let folder = null;
		let accent = null;
		let icon = null;

		if(parent !== null) {
			folder = this.findProject(parent);

			if(folder instanceof ProjectFolder) {
				database = folder.projects;
				accent = folder.accent;
			}
		}

		database.push(new ProjectEntry({
			id: uuid.v4(),
			name: name,
			path: path,
			accent: accent,
			icon: icon
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
		let found = this.findProject(id);
		let folder = null;

		let shouldInsertAfter: boolean = false;
		let inset: boolean = false;
		let key: any = 0;

		if(found === null)
		return Util.println(
			`project ${id} not found`,
			'Config::moveProject'
		);

		// determine the thing to contain this project exists.

		database = this.database;

		if(into !== null) {
			folder = Util.findInArrayById(this.database, into);

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

		// determine if we dragged this to a project that came before or
		// after the one to move. this makes drag drop feel better when
		// dragging things farther down a list. but don't do anything
		// if we dragged it upon ourselves.

		if(before !== null) {
			if(found.id === before)
			return;

			for(key in database) {
				if(database[key].id === before) {
					shouldInsertAfter = false;
					break;
				}

				if(database[key].id === found.id) {
					shouldInsertAfter = true;
					break;
				}
			}
		}

		// pull the thing we are moving out and reset our database
		// references for later manipulation since this find/remove method
		// ends up returning new arrays i think.

		this.findProject(found.id, true);

		if(folder instanceof ProjectFolder)
		database = folder.projects;
		else
		database = this.database;

		// then determine if it needs to go into a specific spot into the
		// the final dataset finding the array offset now that the original
		// item has been removed.

		key = 0;

		if(before !== null) {
			for(key in database) {
				if(database[key].id === before) {
					inset = true;
					break;
				}
			}
		}

		key = parseInt(key);

		if(shouldInsertAfter)
		key += 1;

		// summarize what we've determined.

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

		if(inset)
		database.splice(key, 0, found);
		else
		database.push(found);

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
