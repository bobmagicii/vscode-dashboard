import * as vscode from 'vscode';

class Util {

	public static println(message: string, source: string='DEBUG'):
	void {

		console.log(`[DASH ${source}] ${message}`);
		return;
	}



};

export default Util;
