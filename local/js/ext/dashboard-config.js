import TemplatedDialog from './templated-dialog.js';
import Message from "./message.js";

class DashboardConfig
extends TemplatedDialog {

	constructor(api,) {
		super(api, '#TemplateDashboardConfig');
		this.bindElements();
		this.bindPresetButtons();
		this.bindAcceptButton();
		this.bindCancelButton();
		this.show();
		return;
	};

	bindElements() {

		this.inputTitle = this.el.find('.Title');
		this.inputFolderSizing = this.el.find('.FolderSizing');
		this.inputColumnSizing = this.el.find('.ColumnSizing');
		this.inputShowPaths = this.el.find('.ShowPaths');
		this.inputOpenOnNewWindow = this.el.find('.OpenOnNewWindow');
		this.inputFontSize = this.el.find('.FontSize');

		this.btnFolderSizingPresets = this.el.find('.DashboardFolderPreset');
		this.btnColumnSizingPresets = this.el.find('.DashboardColumnPreset');
		this.btnAccept = this.el.find('.Save');
		this.btnCancel = this.el.find('.Cancel');

		return;
	};

	bindPresetButtons() {

		let self = this;

		self.btnFolderSizingPresets
		.on('click', function(){

			let that = jQuery(this);
			let value = that.attr('data-value');

			self.inputFolderSizing
			.val(value);

			return;
		});

		self.btnColumnSizingPresets
		.on('click', function(){

			let that = jQuery(this);
			let value = that.attr('data-value');

			self.inputColumnSizing
			.val(value);

			return;
		});

		return;
	};

	bindAcceptButton() {

		let self = this;

		(this.btnAccept)
		.on('click',function() {

			let config = {
				title: self.inputTitle.tval(),
				folderSizing: self.inputFolderSizing.tval(),
				columnSizing: self.inputColumnSizing.tval(),
				showPaths: !!parseInt(self.inputShowPaths.tval()),
				openOnNewWindow: !!parseInt(self.inputOpenOnNewWindow.tval()),
				fontSize: self.inputFontSize.tval()
			};

			self.api.send(new Message('configset', config));

			self.hide();

			return false;
		});

		return;
	};

	bindCancelButton() {

		(this.btnCancel)
		.on('click', this.hide.bind(this));

		return;
	};

	fillConfigValues() {

		this.inputTitle.val(this.api.title);
		this.inputFolderSizing.val(this.api.folderSizing);
		this.inputColumnSizing.val(this.api.columnSizing);
		this.inputShowPaths.val(this.api.showPaths ? '1' : '0');
		this.inputOpenOnNewWindow.val(this.api.openOnNewWindow ? '1' : '0');
		this.inputFontSize.val(this.api.fontSize);

		return;
	};

	show() {
		this.fillConfigValues();
		super.show();
		return;
	};

};

export default DashboardConfig;
