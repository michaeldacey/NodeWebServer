export class DebugHelper
{
	// Attributes
	
	// Constructor
	
	// Properties
	
	// Methods
	DumpObject(obj: any, msg: string = ""): void
	{
		let output:string = msg;
		for (var property in obj) {
			output += property + ': ' + obj[property]+'; ';
		}
		console.log(output);		
	}	
}	
