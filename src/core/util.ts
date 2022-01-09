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

	public static findInArrayById(input: Array<any>, whatYouSeek: any):
	any {

		for(const item of input)
		if(typeof item.id !== 'undefined')
		if(item.id === whatYouSeek)
		return item;

		return null;
	};

};

export default Util;
