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

	public static randomColourLike(input: string):
	string {

		let output = input;
		let bytes: Array<string>|null = input.match(/\#([a-z0-9]{2})([a-z0-9]{2})([a-z0-9]{2})/);
		let burts: Array<number> = new Array;

		if(!bytes)
		return output;

		////////

		output = '#';
		bytes.shift();

		for(const byte of bytes)
		burts.push(
			Util.clamp(
				(parseInt(byte, 16) + (Util.randomInt(50) * (Util.randomInt(1) * -1))),
				0, 255
			)
		);

		for(const burt of burts)
		output += burt.toString(16).padStart(2, '0');

		////////

		Util.println(`input: ${input}, output: ${output}`);

		return output;
	};

	public static randomInt(cap: number):
	number {

		return Math.round(Math.random() * cap);
	};

	public static clamp(input: number, min: number, max: number):
	number {

		return Math.min(Math.max(input, min), max);
	};

};

export default Util;
