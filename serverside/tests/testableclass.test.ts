import { TestableClass } from './testableclass';
import assert from 'assert';

let testObj: TestableClass;

before(() => {
	//console.log("Before tests start");
	testObj = new TestableClass(0);
});

beforeEach(() => {
	//console.log("****** Before each test starts");
	testObj.Clear();
});

describe('Given a TestableClass', () => {

  describe('When adding a number', () => {
    it('then it should return 2 when we add 2', () => {
		let expected: number = 2;
		let actual: number;
		testObj.AddTo(2);
		actual = testObj.Result;
		assert.equal(actual, expected);
    });
	
	it('then it should return 0 when we add -1', () => {
		let expected: number = 0;
		let actual: number;
		testObj.AddTo(-1);
		actual = testObj.Result;
		assert.equal(actual, expected);
    });
  });
});

afterEach(() => {
	//console.log("****** After each test finishes");
});

after(() => {
	//console.log("After tests finish");
});

