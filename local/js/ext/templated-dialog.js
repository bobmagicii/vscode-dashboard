
class TemplatedDialog {

	constructor(api, selector) {
		this.api = api;

		this.el = (
			jQuery(selector)
			.clone()
			.removeAttr('id')
			.removeClass('Template')
			.removeClass('d-none')
		);

		this.overlay = jQuery('#Overlay');
		this.mount = this.overlay.find('.Mount');

		this.bindCloseButton();

		return;
	};

	bindCloseButton() {

		this.btnClose = this.el.find('.Close');
		this.btnClose.on('click', this.destroy.bind(this));

		return;
	};

	destroy() {

		this.hide();

		(this.el)
		.remove();

		delete this.el;

		return;
	};

	hide() {

		(this.el)
		.detach();

		(this.overlay)
		.addClass('d-none');

		return;
	};

	show() {

		jQuery('*[data-toggle=dropdown')
		.dropdown('hide');

		(this.mount)
		.append(this.el);

		(this.overlay)
		.removeClass('d-none');

		return;
	};

};

export default TemplatedDialog;
