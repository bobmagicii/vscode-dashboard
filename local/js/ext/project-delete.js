import TemplatedDialog from './templated-dialog.js';
import Message from './message.js';

class ProjectDelete
extends TemplatedDialog {

	constructor(api, item) {
		super(api, '#TemplateProjectDelete');
		this.item = item;
		this.bindElements();
		this.bindAcceptButton();
		this.bindCancelButton();
		this.fillConfigValues();
		this.show();
		return;
	};

	bindElements() {

		this.textName = this.el.find('.NamePreview');
		this.textIcon = this.el.find('.IconPreview');

		this.btnAccept = this.el.find('.Accept');
		this.btnCancel = this.el.find('.Cancel');

		return;
	};

	bindAcceptButton() {

		let self = this;

		this.btnAccept
		.on('click',function(){
			let id = self.item.id;

			self.api.send(new Message(
				'projectdel',
				{ id }
			));

			self.hide();
			return false;
		});

		return;
	};

	bindCancelButton() {

		this.btnCancel
		.on('click', this.hide.bind(this));

		return;
	};

	fillConfigValues() {

		this.textName.text(this.item.name);
		this.textIcon.addClass(this.item.icon);

		return;
	};
};

export default ProjectDelete;
