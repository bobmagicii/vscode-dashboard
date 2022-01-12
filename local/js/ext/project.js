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

		self.btnMenu
		.dropdown();

		self.el
		.attr('data-id', self.item.id)
		.attr('data-parent', self.parent)
		.on('mouseleave',function(){
			jQuery('*[data-toggle=dropdown')
			.dropdown('hide');
			return;
		})
		.removeClassEx(/^col/)
		.addClass(`${this.api.columnSizing} ${self.el.attr('class')}`)
		.on('click', function() {

			if(jQuery('body').hasClass('ReorderProject')) {
				jQuery('body').removeClass('ReorderProject');
				return false;
			}

			self.api.send(new Message(
				'projectopen',
				{ id: self.item.id }
			));
			return false;
		});

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

			//jQuery('body')
			//.removeClass('ReorderProject');

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
