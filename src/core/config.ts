import * as vscode from 'vscode';
import ProjectEntry from "./project-entry";
import Util from './util';

class Config {

	title: string;
	debug: boolean;
	database: Array<ProjectEntry>;

	constructor() {

		this.title = 'Projects';
		this.debug = false;
		this.database = [];

		this.fillFromEditorConfig();
		return;
	};

	public fillFromEditorConfig():
	void {

		let data = (
			(vscode.workspace)
			.getConfiguration('projectsyeah')
		);

		data.database.push(new ProjectEntry('Test 1', '/opt/test1'));
		data.database.push(new ProjectEntry('Test 2', 'bob@dev:/opt/dev'));

		////////

		this.debug = data.debug;

		for(const item of data.database)
		this.database.push(ProjectEntry.FromObject(item));

		return;
	};

};

export default Config;
