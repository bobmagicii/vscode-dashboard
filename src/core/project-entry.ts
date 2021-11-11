
class ProjectEntry {

	public icon: string;
	public name: string;
	public path: string;

	constructor(name: string, path: string) {

		this.name = name;
		this.path = path;
		this.icon = this.getIcon();

		return;
	};

	public getIcon():
	string {

		if(this.path.match(/.+?@.+?:/))
		return 'remote-explorer';

		return 'folder';
	};

	static FromObject(input: { name: string, path: string }):
	ProjectEntry {

		return new ProjectEntry(
			input.name,
			input.path
		);
	};

};

export default ProjectEntry;
