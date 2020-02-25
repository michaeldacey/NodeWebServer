export class TestableClass
{
	// Attributes
	private _number: number;
	
	// Constructor
	constructor(n: number = 0)
	{
		this._number = n;
	}
	
	// Properties
	get Result(): number { return this._number; }
	
	// Methods
	AddTo(n: number): void
	{
		if(n > 0)
		{
			this._number += n;
		}
	}	
	
	Clear(): void
	{
		this._number = 0;
	}
}	
