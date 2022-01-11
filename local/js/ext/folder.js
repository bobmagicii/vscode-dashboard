import Project from './project.js';
import ProjectConfig from './project-config.js';
import ProjectNew from './project-new.js';
import ProjectDelete from './project-delete.js';
import Message from './message.js';

class Folder {

	constructor(api, item) {
		this.id = item.id;
		this.api = api;
		this.item = item;
		this.el = this.api.template.folder.clone();
		this.bindElements();
		this.prepareElements();
		this.fillWithProjects();
		return;
	};

	bindElements() {

		this.container = this.el.find('.ProjectEntry');
		this.icon = this.el.find('.Icon i');
		this.name = this.el.find('.Name');
		this.btnDelete = this.el.find('.Delete');
		this.btnEdit = this.el.find('.Edit');
		this.btnReorder = this.el.find('.Reorder');
		this.btnConfig = this.el.find('.Config');
		this.btnProject = this.el.find('.NewProject');
		this.projects = this.el.find('.Projects');

		return;
	};

	prepareElements() {

		let self = this;

		self.container
		.css('border-color', self.item.accent);

		self.icon
		.addClass(`${self.item.icon}`);

		self.name
		.text(self.item.name);

		self.btnDelete
		.on('click', function(){
			new ProjectDelete(self.api, self.item);
			return false;
		});

		self.btnEdit
		.on('click', function(){
			new ProjectConfig(self.api, self.item);
			return false;
		});

		self.btnReorder
		.on('mousedown.reorder', function(ev){
			self.handleReordering(ev);
			return false;
		});

		self.btnProject
		.on('click', function(){
			self.el.addClass('Open');
			new ProjectNew(self.api, self.item.id);
			return;
		});

		self.btnConfig
		.dropdown();

		self.el
		.attr('data-id', self.item.id);

		self.el.find('.Fold')
		.on('click', function(){
			self.el.toggleClass('Open');

			if(self.el.hasClass('Open'))
			self.api.send(new Message('folderopen', { id: self.item.id }));
			else
			self.api.send(new Message('folderclose', { id: self.item.id }));

			return false;
		});

		if(self.item.open)
		self.el.addClass('Open');

		// use the configured column sizing. main trick here is bootstrap's
		// column clases are tehdumb and must be the first in the list as
		// they use some of those pattern matching selectors. so strip out
		// all the old size classes, then put the new ones on the front of
		// whatever was leftover.

		self.el
		.removeClassEx(/^col/)
		.addClass(`${this.api.folderSizing} ${self.el.attr('class')}`);

		return;
	};

	fillWithProjects() {

		let self = this;

		self.projects.empty();

		for(const item of self.item.projects) {
			if(typeof item.path === 'undefined')
			continue;

			let project = new Project(
				self.api,
				item,
				self.id
			);

			self.projects
			.append(project.el);
		}

		return;
	};

	getIcon() {

		return 'codicon-root-folder';
	};

	handleReordering(ev) {

		const evHover = 'mouseover.reorder';
		const evLeave = 'mouseleave.reorder';
		const evMouseUp = 'mouseup.reorder';

		let self = this;
		let target = null;
		let dropzones = jQuery('#ProjectBox').find('.Folder, .Project');

		dropzones
		.on(evLeave, function(){
			target = jQuery('#ProjectBox');
			return false;
		})
		.on(evHover, function(){
			target = jQuery(this);
			return false;
		});

		jQuery('body')
		.addClass('ReorderFolder');

		jQuery(document)
		.on(evMouseUp, function(){

			jQuery(document)
			.off(evMouseUp);

			jQuery(self.api.elMain)
			.off(evHover);

			dropzones
			.off(evLeave)
			.off(evHover);

			jQuery('body')
			.removeClass('ReorderFolder');

			if(!target) {
				// destroy ghost probably
				return false;
			}

			let tid = target.attr('data-id');
			let pid = target.attr('data-parent') ?? null;

			////////

			if(target.hasClass('Folder')) {
				//target
				//.find('.Projects')
				//.append(self.el);

				self.api.send(new Message('projectmove', { id: self.id, before: tid }));

				return false;
			}

			if(target.hasClass('Project')) {
				//target.before(self.el);

				if(pid !== null)
				self.api.send(new Message('projectmove', { id: self.id, before: pid }));

				else
				self.api.send(new Message('projectmove', { id: self.id, before: tid }));

				return false;
			}

			//target.append(self.el);
			self.api.send(new Message('projectmove', { id: self.id, before: null, into: null }));

			return false;
		});

		return;
	};

};

export default Folder;
