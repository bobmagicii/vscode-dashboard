import Message from './message.js';
import Dashboard from './dashboard.js';
import ProjectConfig from './project-config.js';
import ProjectDelete from './project-delete.js';

class Project {
	constructor(api, item, parent=null) {
		this.id = item.id;
		this.api = api;
		this.item = item;
		this.parent = parent;
		this.el = this.api.template.project.clone();
		this.bindElements();
		this.prepareElements();
		return;
	};

	bindElements() {

		this.boxEntry = this.el.find('.ProjectEntry');
		this.textName = this.el.find('.Name');
		this.textIcon = this.el.find('.Icon i');
		this.textPath = this.el.find('.Path');
		this.btnDelete = this.el.find('.Delete');
		this.btnEdit = this.el.find('.Edit');
		this.btnReorder = this.el.find('.Reorder');
		this.btnMenu = this.el.find('.Config');
		this.btnOpen = this.el.find('.OpenProject');

		return;
	};

	prepareElements() {

		let self = this;

		self.boxEntry
		.css('border-color', self.item.accent);

		self.textIcon
		.addClass(`${self.item.icon}`);

		self.textName
		.text(self.item.name);

		self.textPath
		.text(Dashboard.readableURI(self.item.path));

		self.btnDelete
		.on('mouseup.delete', function(){
			new ProjectDelete(self.api, self.item);
			return false;
		});

		self.btnEdit
		.on('mouseup.config', function(){
			new ProjectConfig(self.api, self.item);
			return false;
		});

		self.btnMenu
		.on('mouseup.menu', function(ev){
			// prevent mouseup bubble to entry.
			self.btnReorder.trigger('mouseup.reorder');
			return false;
		})
		.dropdown();

		self.btnReorder
		.on('mousedown.reorder', function(ev){
			self.handleReordering(ev);
			return false;
		});

		(self.el)
		.attr('data-id', self.item.id)
		.attr('data-parent', self.parent)
		.removeClassEx(/^col/)
		.addClass(`${this.api.columnSizing} ${self.el.attr('class')}`)
		.on('mouseleave',function(){
			// force close drop downs any time we leave an object.
			jQuery('*[data-toggle=dropdown')
			.dropdown('hide');
			return;
		});

		this.btnOpen
		.on('mouseup.open', function(){

			let openNewWindow = !!parseInt(
				jQuery(this)
				.attr('data-open-new-window')
			);

			self.api.send(new Message(
				'projectopen',
				{ id: self.item.id, openNewWindow: openNewWindow }
			));

			return false;
		});

		// this stupid thing instead of just using click
		// was invented as a way to negotiate allowing the buttons on
		// the project to do things. the reorder handle for example needs
		// to allow click drag and conf menu needs a click. we can
		// reconsile both of those via mousedown and mouseup events intead
		// having them eat their events before the base button gets
		// button gets triggered for opening the projects.

		(self.el)
		.on('mousedown.open', function() {
			jQuery(this)
			.on('mouseup.open', function(){
				let openNewWindow = !!parseInt(
					jQuery(this)
					.attr('data-open-new-window')
				);

				self.api.send(new Message(
					'projectopen',
					{ id: self.item.id, openNewWindow: openNewWindow }
				));

				return false;
			});
			return false;
		});

		////////

		if(!self.api.showPaths)
		self.textPath.addClass('d-none');

		return;
	};

	getIcon() {

		if(self.item.path.match(/^file:/))
		return 'codicon-folder';

		return 'codicon-remote-explorer';
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
		.addClass('ReorderProject');

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
			.removeClass('ReorderProject');

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

				self.api.send(new Message('projectmove', { id: self.id, into: tid }));

				return false;
			}

			if(target.hasClass('Project')) {
				//target.before(self.el);

				self.api.send(new Message('projectmove', { id: self.id, before: tid, into: pid }));

				return false;
			}

			//target.append(self.el);
			self.api.send(new Message('projectmove', { id: self.id, before: null, into: null }));

			return false;
		});

		return;
	};

};

export default Project;
