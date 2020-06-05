import {
	KeyValuePairs
} from './keyvaluepairs';

export class UrlComparator
{
	// Attributes
	
	// Constructor
	
	// Properties
	
	// Methods
	CompareRouteUrl(url: string, routeUrl: string, args: KeyValuePairs): boolean
	{
		let urlPos: number = 0;
		let rUrlPos: number = 0;
		
		// break the url for REST service processing
		// e.g. /service/do/$action/product/$productId
		// should match /service/do/edit/product/12
		// action = "edit" and productId=12

		while(urlPos < url.length
		&& rUrlPos < routeUrl.length)
		{
			if(routeUrl[rUrlPos] == '$')
			{
				rUrlPos++;
				let fieldName: string = this.ExtractUrlField(routeUrl, rUrlPos);
				let fieldValue: string = this.ExtractUrlField(url, urlPos);
				let fieldParts: string[] = fieldName.split(':');

				rUrlPos += fieldName.length; 
				urlPos += fieldValue.length;
				if(fieldParts.length > 0)
				{
					args[fieldParts[0]] = this.CastFieldType(fieldParts[1], fieldValue);
					if(Object.is(args[fieldParts[0]], NaN))
					{
						console.log("Value does not match type required type:" + fieldParts[1]);
						return false;
					}
				}
				else
				{
					args[fieldParts[0]] = fieldValue; // By default, just return string value
				}
			}
			else if(url[urlPos++] != routeUrl[rUrlPos++])
			{
				console.log("No match...");
				return false;
			}
		}
				
		// If we've reached the end of the url then
		// we have found a match
		return urlPos == url.length && rUrlPos == routeUrl.length;
	}
	
	private ExtractUrlField(url: string, index: number): string
	{
		let part: string = "";
		while(index < url.length && url[index] != '/')
		{
			part += url[index++];
		}
		return part;
	}
	
	private CastFieldType(fieldType:string, value:string): any
	{
		if(fieldType == "string"||fieldType == "s")
		{
			return value;
		}
		else if(fieldType == "int"||fieldType == "i")
		{
			if(this.IsDigits(value) == false) return NaN;
			return parseInt(value);
		}				
		else if(fieldType == "float"||fieldType == "f")
		{
			if(this.IsDigits(value) == false) return NaN;
			return parseFloat(value);
		}	
		else if(fieldType == "number"||fieldType == "n")
		{
			if(this.IsDigits(value) == false) return NaN;
			return Number(value);
		}			
		return value;	// By default, just return string value
	}
	
	private IsDigits(text: string, allowDot: boolean = false): boolean
	{
		for (let i = 0; i < text.length; i++) 
		{
			let d: number = text.charCodeAt(i);
			console.log("n="+d);
			if (d == 46)
			{
				if(allowDot == false) return false;
			}
			else if (d < 48 || d > 57)
			{
				return false;
			}				
		}
		return true
	}	
}	
