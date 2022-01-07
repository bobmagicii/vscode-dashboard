import * as vscode from 'vscode';

class Util {

	public static println(message: string, source: string='DEBUG'):
	void {

		console.log(`[DASH ${source}] ${message}\n`);
		return;
	}


	public static filterArrayStrip(input: Array<any>, whatYouSeek: any) {
		return input.filter(function(val: any, key: any){
			return val !== whatYouSeek;
		});
	};

	public static filterArrayStripById(input: Array<object>, whatYouSeek: any):
	Array<any> {
		return input.filter(function(val: any, key: any){
			return (
				(typeof val.id !== 'undefined')
				&& (val.id !== whatYouSeek)
			);
		});
	};

};

export default Util;
