import { 
	ServerResponse
} from 'http';

import {
	join as fsCreatePath,
	extname as fsExtName,
	basename as fsFileBaseName
} from 'path';

import {
	readFile as fsReadFile,
	readdir as fsReadDir,
	readdirSync as fsReadDirSync,
	stat as fsStat,
	statSync as fsStatSync,
	Stats as FsStats,
	createReadStream as fsCreateReadStream,
	ReadStream as FsReadStream,
	access as fsAccess,
	constants as fsConstants
} from 'fs';

export class FileHandler
{
	// Attributes
	private _directory: string;
	
	// Constructor
	constructor(directory: string = ".")
    {
		this._directory = directory
    }
	
	// Properties
	set Directory(value: string) { this._directory = value; }
	get Directory(): string { return this._directory; }
	
	// Methods
	public ReadFile(filepath: string): Promise<Buffer>
	{
		return new Promise<Buffer>((resolve:(res:any) => void, reject:(res:any) => void) => 
		{
			let fullpath: string = fsCreatePath(this._directory, filepath);
			
			fsAccess(fullpath, fsConstants.F_OK, (error) => {
				if (error) 
				{
					reject(error);
					return;
				}

				//file exists
				fsReadFile(fullpath, (error: Error|null, data: Buffer|null) => 
				{
					if (error) 
					{
						reject(error);
						return;
					}
					
					resolve(data);
				});
			})		
		});		
	}
	
	public ReadHtmlFile(filename: string): Promise<Buffer>
	{
		return new Promise<Buffer>((resolve:(res:any) => void, reject:(res:any) => void) => 
		{
			let promise: Promise<Buffer> = this.ReadFile(filename+'.html');
	
			promise.then((data:Buffer):void => {
				resolve(data);
			}).catch((error: Error):void => {
				// Typically we would to chain promises rather than
				// than nest promises like this. I am a bit stuck
				// here because I need handle an error which
				// occurs when the file is not found.	
				let promise: Promise<Buffer> = this.ReadFile(filename+'.htm');
				
				promise.then((data:Buffer):void => {
					resolve(data);
				}).catch((error: Error):void => {
					reject(error);
				});
			});
		});
	}
	
	public StreamLargeFile(filepath: string, response: ServerResponse): void
	{
		let fullpath: string = fsCreatePath(this._directory, filepath);
		fsAccess(fullpath, fsConstants.F_OK, (error) => {
			
			if(error !== undefined)
			{
				let readStream: FsReadStream = fsCreateReadStream(fullpath);
				
				readStream.on('open', () => {
					readStream.pipe(response);
				});
				
				readStream.on('error', (error) => {
					response.end(error);
				});
			}
			else
			{
				response.end(error);
			}
		});
	}	
}	




