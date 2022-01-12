import TemplatedDialog from "./templated-dialog.js";
import Message from "./message.js";

class ProjectNew
extends TemplatedDialog {

	constructor(api, parent=null) {
		super(api, '#TemplateProjectNew');
		this.parent = parent;
		this.bindElements();
		this.bindTypeSelector();
		this.bindSaveButton();
		this.bindFolderChooser();
		this.show();
		return;
	};

	bindElements() {

		this.typeSelector = this.el.find('.TypeSelector');
		this.inputName = this.el.find('.Name');
		this.inputSshUser = this.el.find('.ShellUser');
		this.inputSshHost = this.el.find('.ShellHost');
		this.inputSshPath = this.el.find('.ShellPath');
		this.inputPromode = this.el.find('.Promode');
		this.btnChooser = this.el.find('.Chooser');
		this.btnSave = this.el.find('.Save');

		return;
	};

	bindTypeSelector() {

		let self = this;

		this.typeSelector
		.find('.btn')
		.on('click', function(){

			let that = jQuery(this);
			let type = that.attr('data-type');

			// dedcide which button is lit.

			self.typeSelector
			.find('.btn')
			.addClass('btn-dark')
			.removeClass('btn-primary');

			that
			.addClass('btn-primary')
			.removeClass('btn-dark');

			// display the selected type input form.

			(self.el.find('.TypeNewForm'))
			.addClass('d-none');

			(self.el.find(that.attr('data-show')))
			.removeClass('d-none');

			// allow progress when type is selected and make note of.

			(self.el.find('footer'))
			.removeClass('d-none');

			self.typeSelector
			.attr('data-selected', type);

			// reset the file chooser.

			self.setDirectory(null);

			return;
		});

		return;
	};

	bindSaveButton() {

		let self = this;

		this.btnSave
		.on('click',function(){

			let type = self.typeSelector.attr('data-selected');
			let name = self.inputName.tval();
			let uri = null;
			let parent = self.parent;

			switch(type) {
				case 'local':
					uri = jQuery.trim(self.btnChooser.attr('data-uri'));
				break;
				case 'ssh':
					let host = self.inputSshHost.tval();
					let user = self.inputSshUser.tval();
					let path = self.inputSshPath.tval();
					uri = `vscode-remote://ssh-remote+${user}@${host}${path}`;
				break;
				case 'promode':
					uri = self.inputPromode.tval();
				break;
			}

			if(uri === null || uri === '')
			return;

			(self.el.find('.Close'))
			.trigger('click');

			self.api.send(new Message('projectnew', { name, uri, parent }));
			return;
		});

		return;
	};

	bindFolderChooser() {

		let self = this;

		jQuery(document)
		.on('dirpick', function(ev, data){

			if(typeof data.label !== 'string')
			return;

			if(typeof data.uri !== 'string')
			return;

			self.setDirectory(data);
			return;
		});

		self.btnChooser
		.on('click', function(){
			self.api.send(new Message('pickdir'));
			return;
		});

		return;
	};

	setDirectory(input) {

		if(input === null) {
			this.btnChooser
			.removeClass('cased')
			.text(this.btnChooser.attr('data-default'))
			.attr('data-uri', '');

			return;
		}

		if(this.inputName.tval() === '')
		this.inputName.val(input.uri.split(/[\/\\]/).pop());

		this.btnChooser
		.addClass('cased')
		.text(input.label)
		.attr('data-uri', input.uri);

		return;
	};

	show() {

		this.setDirectory(null);
		this.inputName.val('');
		this.inputSshHost.val('');
		this.inputSshUser.val('');
		this.inputSshPath.val('');
		this.inputPromode.val('');

		super.show();
		return;
	};
};

export default ProjectNew;
