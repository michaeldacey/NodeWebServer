import { UrlComparator } from '../ts/urlcomparator';
import { KeyValuePairs } from '../ts/keyvaluepairs';
import assert from 'assert';

let testObj: UrlComparator;

before(() => {
	testObj = new UrlComparator();
});

describe('Given a UrlComparator with a simple route /home/hello', () => {
	let route: string = "/home/hello";

	describe('When comparing it with a url /home/hello', () => {
		let url: string = "/home/hello";
		
		it('then it should return true to match the route', () => {			
			let args: KeyValuePairs = [];
			let expected: boolean = true;
			let actual: boolean = testObj.CompareRouteUrl(url, route, args);

			assert.equal(actual, expected);
		});	
		
		it('then it should return no arguments', () => {
			let args: KeyValuePairs = [];
			let expected: number = 0;
			let actual: number;
			
			testObj.CompareRouteUrl(url, route, args);
			actual = args.length; // Object.keys(obj).length

			assert.equal(actual, expected);
		});	
	});
	
	describe('When comparing it with a url /home/goodbye', () => {
		let url: string = "/home/goodbye";
		
		it('then it should return false and fail to match the route', () => {			
			let args: KeyValuePairs = [];
			let expected: boolean = false;
			let actual: boolean = testObj.CompareRouteUrl(url, route, (key:string, value:any) => args[key] = value);

			assert.equal(actual, expected);
		});				
	});
});


