import * as vscode from 'vscode';
import * as ColourParser from 'color';

class Util {

	public static println(message: string, source: string='DEBUG'):
	void {

		console.log(`[DASH ${source}] ${message}\n`);
		return;
	}

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	// FILTERS

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

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	// SEEKERS

	public static findInArrayById(input: Array<any>, whatYouSeek: any):
	any {

		for(const item of input)
		if(typeof item.id !== 'undefined')
		if(item.id === whatYouSeek)
		return item;

		return null;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	// RANDERS

	public static randomInt(cap: number):
	number {

		return Math.round(Math.random() * cap);
	};

	public static randomIntPN(cap: number):
	number {

		return (Util.randomInt(cap) * Util.randomNegative());
	};

	public static randomNegative():
	number {

		return ((Util.randomInt(1) === 1) ? 1 : -1);
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	// COLOURS

	public static arrayColoursFrom(input: string, num: number, severity: number = 4):
	Array<string> {

		let output = new Array;

		for(num; num >= 0; --num) {
			output.push(
				ColourParser(input)
				.rotate(num * severity)
				.hex()
			);
		}

		return output;
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	// SORTS

	public static sortFuncByNameDesc(a: any, b: any):
	number {

		return (
			(a.name ?? 0)
			.toString()
			.localeCompare(
				(b.name ?? 0)
				.toString()
			)
		);
	};

	public static sortFuncByNameAsc(a: any, b: any):
	number {

		return (
			(b.name ?? 0)
			.toString()
			.localeCompare(
				(a.name ?? 0)
				.toString()
			)
		);
	};

	////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////

	// MATHS

	public static clamp(input: number, min: number, max: number):
	number {

		return Math.min(Math.max(input, min), max);
	};

};

export default Util;
