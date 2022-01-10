import colours from './ext/colours.js';
import icons from './ext/icons.js';
import Dashboard from './ext/dashboard.js';

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

jQuery(document)
.ready(function(){
	jQuery('body .container-fluid')
	.css('display', 'block');

	new Dashboard;
	return;
});
