import TemplatedDialog from './templated-dialog.js';
import Dashboard from './dashboard.js';
import Message from './message.js';
import Colours from './colours.js';
import Icons from './icons.js';

class ProjectConfig
extends TemplatedDialog {

	constructor(api, item) {
		super(api, '#TemplateProjectConfig');
		this.item = item;
		this.bindElements();
		this.bindAccentPreset();
		this.bindIconPreset();
		this.bindAcceptButton();
		this.bindCancelButton();
		this.fillConfigValues();
		this.show();
		return;
	};

	bindElements() {

		this.inputName = this.el.find('.Name');
		this.inputPath = this.el.find('.Path');
		this.inputAccent = this.el.find('.Accent');
		this.inputIcon = this.el.find('.Icon');

		this.textTitlebar = this.el.find('.Titlebar');
		this.binAccent = this.el.find('.AccentPresets > optgroup');
		this.binIcon = this.el.find('.IconPresets > optgroup');
		this.binFolderOptions = this.el.find('.FolderOptions');
		this.binProjectOptions = this.el.find('.ProjectOptions');
		this.previewAccent = this.el.find('.AccentPreview');
		this.previewIcon = this.el.find('.IconPreview');

		this.btnAccept = this.el.find('.Save');
		this.btnCancel = this.el.find('.Cancel');

		return;
	};

	bindAcceptButton() {

		let self = this;

		self.btnAccept
		.on('click',function(){
			let id = self.item.id;
			let name = self.inputName.tval();
			let path = self.inputPath.tval();
			let accent = self.inputAccent.tval();
			let icon = self.inputIcon.tval();

			console.log({ id, name, path, accent, icon });

			self.api.send(new Message(
				'projectset',
				{ id, name, path, accent, icon }
			));

			self.destroy();
			return false;
		});

		return;
	};

	bindCancelButton() {

		this.btnCancel
		.on('click', this.hide.bind(this));

		return;
	};

	bindAccentPreset() {

		let self = this;

		(self.binAccent.parent())
		.on('change', function(){
			let colour = jQuery(this).val();

			self.inputAccent.val(colour);
			self.previewAccent.css('color', colour);

			return;
		});

		(self.inputAccent)
		.on('keyup', function(){
			let colour = self.inputAccent.val();
			self.binAccent.parent().val('');
			self.previewAccent.css('color', colour);
			return;
		});

		return;
	};

	bindIconPreset() {

		let self = this;

		this.binIcon.parent()
		.on('change', function(){
			let icon = jQuery(this).val();

			self.inputIcon.val(icon);
			self.previewIcon.find('i').removeClassEx(/^codicon-/);
			self.previewIcon.find('i').addClass(icon);

			return;
		});

		this.inputIcon
		.on('keyup', function(){
			let icon = self.inputIcon.val();
			self.binIcon.parent().val('');
			self.previewIcon.find('i').removeClassEx(/^codicon-/);
			self.previewIcon.find('i').addClass(icon);
			return;
		});

		return;
	};

	fillConfigValues() {

		let config = Dashboard.findProject(
			this.api.database,
			this.item.id
		);

		if(config === null) {
			console.log(`project config not found ${this.item.id}`);
			return;
		}

		this.inputName.val(config.name);
		this.inputPath.val(config.path);
		this.inputAccent.val(config.accent);
		this.inputIcon.val(config.icon);

		this.binAccent.empty();
		this.binIcon.empty();

		for(const colour in Colours)
		this.binAccent.append(
			jQuery('<option />')
			.text(colour)
			.val(Colours[colour])
			.css('color', Colours[colour])
		);

		for(const icon in Icons)
		this.binIcon.append(
			jQuery('<option />')
			.html(`<i class="codicon ${icon}"></i> ${icon}`)
			.val(Icons[icon])
		);

		return;
	};

	show() {

		this.inputAccent
		.trigger('keyup');

		this.inputIcon
		.trigger('keyup');

		////////

		if(typeof this.item.path === 'undefined') {
			this.binProjectOptions.hide();
			this.textTitlebar.text('Folder Settings');
		}

		else {
			this.binFolderOptions.hide();
		}

		////////

		super.show();
		return;
	};

};

export default ProjectConfig;
