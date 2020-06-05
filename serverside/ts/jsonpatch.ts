
export enum PatchOperation
{
	PATCH_CREATE,	// Add new field and value
	PATCH_UPDATE,	// Update existing field value
	PATCH_REMOVE,	// Remove an existing field
	PATCH_MOVE,
	PATCH_COPY,
	PATCH_TEST,
	PATCH_MERGE		// Add or update as appropriate	
}

// RFC6902
export interface IJsonPatchDocOp
{
	// Note: don't change these names they are defined by RFC6902
	op: string;
	path: string;
	value?: any;
	from?: string;
}

export class JsonPatch
{
	// Attributes
	private _target: string;
	private _operation: PatchOperation;
	private _value: any;
				
	// Constructor
	constructor(target: string, operation: PatchOperation, value: any)
	{
		this._target = target;
		this._operation = operation;
		this._value = value;
	}
	
	// Properties
	get Target(): string
	{
		return this._target;
	}
	
	get Operation(): PatchOperation
	{
		return this._operation;
	}
	
	get Value(): any
	{
		return this._value;
	}
	
	// Methods		
}



// import {
	// KeyValuePairs
// } from './keyvaluepairs';

// export class JsonPatch
// {
	// // Attributes
	// private _urlValues: KeyValuePairs = [];
	// private _createOps: KeyValuePairs = [];
	// private _updateOps: KeyValuePairs = [];
	// private _deleteOps: KeyValuePairs = [];
			
	// // Constructor
	
	// // Properties
	// private get UrlValues(): KeyValuePairs
	// {
		// return this._urlValues;
	// }
	
	// private get CreateOperations(): KeyValuePairs
	// {
		// return this._createOps;
	// }
	
	// get CreateOperationsKeys(): string[]
	// {
		// return Object.keys(this._createOps);
	// }
	
	// get CreateOperationsLen(): number
	// {
		// return Object.keys(this._createOps).length;
	// }
	
	// get UpdateOperations(): KeyValuePairs
	// {
		// return this._updateOps;
	// }
	
	// get UpdateOperationsKeys(): string[]
	// {
		// return Object.keys(this._updateOps);
	// }
	
	// get UpdateOperationsLen(): number
	// {
		// return Object.keys(this._updateOps).length;
	// }
	
	// private get DeleteOperations(): KeyValuePairs
	// {
		// return this._deleteOps;
	// }
	
	// get DeleteOperationsKeys(): string[]
	// {
		// return Object.keys(this._deleteOps);
	// }
	
	// get DeleteOperationsLen(): number
	// {
		// return Object.keys(this._deleteOps).length;
	// }	
	
	// // Methods	
	// AddUrlValue = (key: string, value: any):void =>
	// {
		// this.UrlValues[key] = value;
	// }	
	
	// AddCreateOp = (key: string, value: any):void =>
	// {
		// this.CreateOperations[key] = value;
	// }
	
	// AddUpdateOp = (key: string, value: any):void =>
	// {
		// this.UpdateOperations[key] = value;
	// }

	// AddDeleteOp = (key: string, value: any):void =>
	// {
		// this.DeleteOperations[key] = value;
	// }
	
	// HasUrlValue(key: string): boolean
	// {
		// return typeof this.GetUrlValue(key) != "undefined";
	// }
	
	// GetUrlValue(key: string): any
	// {
		// return this.UrlValues[key];
	// }
	
	// HasCreateOp(key: string): boolean
	// {
		// return typeof this.GetCreateOp(key) != "undefined";
	// }
	
	// GetCreateOp(key: string): any
	// {
		// return this.CreateOperations[key];
	// }
	
	// HasUpdateOp(key: string): boolean
	// {
		// return typeof this.GetUpdateOp(key) != "undefined";
	// }
	
	// GetUpdateOp(key: string): any
	// {
		// return this.UpdateOperations[key];
	// }
	
	// HasDeleteOp(key: string): boolean
	// {
		// return typeof this.GetDeleteOp(key) != "undefined";
	// }
	
	// GetDeleteOp(key: string): any
	// {
		// return this.DeleteOperations[key];
	// }	
// }