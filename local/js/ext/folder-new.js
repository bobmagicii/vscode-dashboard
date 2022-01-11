import TemplatedDialog from './templated-dialog.js';
import Message from "./message.js";

class FolderNew
extends TemplatedDialog {

	constructor(api) {
		super(api, '#TemplateFolderNew');
		this.bindElements();
		this.bindSaveButton();
		this.show();
		return;
	};

	bindElements() {
		this.inputName = this.el.find('.Name');
		this.btnSave = this.el.find('.Save');
		return;
	};

	bindSaveButton() {

		let self = this;

		this.btnSave
		.on('click', function(){

			let name = self.inputName.tval();

			if(name === null || name === '')
			return;

			(self.el.find('.Close'))
			.trigger('click');

			self.api.send(new Message('foldernew', { name }));
			return;
		});

		return;
	};

	show() {

		this.inputName.val('');

		super.show();
		return;
	};
};

export default FolderNew;
