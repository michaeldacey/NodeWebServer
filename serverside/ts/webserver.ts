import { 
	createServer, 
	Server,
	IncomingMessage,
	ServerResponse
} from 'http';
		
import {
	parse,
	Url
} from 'url';

import { 
	parse as bodyParse
} from 'querystring';

import {
	join as fsCreatePath,
	basename as fsBaseName,
	extname as fsExtName
} from 'path';

import {
	readFile as fsReadFile
} from 'fs';

import {
	FileHandler,
} from './filehandler';

// Install using
// npm install formidable
// npm install @types/formidable
// https://github.com/node-formidable/node-formidable
import {
	IncomingForm,
	Files as FormidableFiles
} from 'formidable';

import {
	KeyValuePairs
} from './keyvaluepairs';

import {
	Router,
	RouteCallback,
	Route
} from './router';

import {
	IPageController
} from './ipagecontroller';

import {
	DebugHelper
} from './debughelper';

export class WebServer
{
	// Attributes
	private _hostname: string;
	private _port: number;
	private _server: Server;
	private _router: Router;
	private _pagesDir: FileHandler;
	private _pageControllersDir: string;
	private _uploadDir: string;
	private _uploadEncoding: string;

	// Create a list of files the server supports by
	// file extension e.g. ".js", and the related
	// HTTP content type that should be used when the
	// file is returned to the browser.
	// Are implementation is very crude because we
	// just serve the file "as is" instead of parsing
	// it first which in the way you might expect if 
	// you were requesting a ".php" file. You will need
	// to add a route entry if you want to be this clever.
	// Note for HTTP text types e.g. text\html, text\plain, etc.,
	// specify the charset or the browser gets unhappy.
	// Following the '#' is the virtual directory location
	// of these files, this appended to the _pagesDir which
	// represents the base directory where all content is placed.
	private static _fileTypes: any = {
		".htm":"text/html; charset=utf-8#./",
		".html":"text/html; charset=utf-8#./",
		".js":"application/javascript#../dist",
		".css":"text/css#../css"
	};
	
	// Constructor
	constructor(hostname: string, port: number, router: Router, pageDir: string = "./clientside/html")
    {
		this._hostname = hostname;
		this._port = port;
		
		// This is the actual location where the HTML
		// pages and other content are stored on the
		// physical machine hosting the server.
		this._pagesDir = new FileHandler(pageDir);
		
		this._pageControllersDir = "../pagecontrollers";
		this._uploadDir = "./uploads";
		
		this._uploadEncoding = 'utf-8';
		this._server = createServer(this.OnRequest);
		this._router = router;
		this.InitDefaultRoute();
    }
	
	// Properties
	get HostName(): string { return this._hostname; }
	get Port(): number { return this._port; }
	get Router(): Router { return this._router; }
	set PageDir(value: string) { this._pagesDir.Directory = value; }
	get PageDir(): string { return this._pagesDir.Directory; }
	set UploadDir(value: string) { this._uploadDir = value; }
	get UploadDir(): string { return this._uploadDir; }	
	set UploadEncoding(value: string) { this._uploadEncoding; }
	
	// Methods
	
	// Call this once to start the server.
	Listen(): void
	{
		// Listen for incoming connections
		// You effectively go into an infinite event handling
		// loop!!
		this._server.listen(this.Port, this.HostName, () =>
		{
			console.log(`Server running at http://${this.HostName}:${this.Port}/`);
		});
	}
	
	// Handle incoming HTTP Requests
	// Using the callback (lambda)syntax for OnRequest because
	// I want "this" to refer to the instance of WebServer
	// i.e. the object itself as we expect in Object
	// Oriented Programming.
	private OnRequest = (request:IncomingMessage, response:ServerResponse): void =>
	{
		// Note: The exclamation marks tells the compiler
		// that the value is never null here!!
		// e.g. request.url! means the compiler should
		// ignore the fact that this might be null because
		// we know it will not be at this point in our code.
		
		let requestedUrl: Url = parse(request.url!, true);
		console.log("Incoming Req: " + request.url)
		if(requestedUrl !== null)
		{
			let urlPath: string = requestedUrl.pathname!;
			let method: string = request.method!.toLowerCase();
			
			// All the values provided in the HTTP Request from
			// the component parts of the URI, the URL args and 
			// the Request body args, are all recovered
			// and placed in this "args" array to be passed
			// the users callback for the route they added.
			let args: KeyValuePairs = [];
						
			if(method == "get")
			{
				this.ReadUrlArgs(requestedUrl.query!, args);
				if(this.ProcessGetRequest(urlPath, method, response, args) == false)
				{
					this.ProcessRequest(urlPath, method, response, args);
				}				
			}
			else if(method == "post")
			{
				console.log("handling post:"+request.headers['content-type']);
				switch(request.headers['content-type'])
				{
					case 'multipart/form-data':
						// The content type “application/x-www-form-urlencoded” 
						// is inefficient for sending large quantities of binary 
						// data or text containing non-ASCII characters. 
						// The content type “multipart/form-data” should be used for
						// submitting forms that contain files, non-ASCII data, 
						// and binary data
						this.ProcessMultipartUpload(request, (err: Error|null, details: UploadDetails) => {
							if(err===null)
							{
								this.ProcessRequest(urlPath, method, response, details);
							}
							else
							{
								response.writeHead(400, {'Content-Type':'text/plain; charset=utf-8'});
								response.end(err.message);
								request.connection.destroy();
							}							
						});
						break;
					case 'application/json':
						this.ProcessPostedBodyArgs(request, (body:string, success: boolean)=> {
							if(success)
							{
								(new DebugHelper()).DumpObject(JSON.parse(body), "JSON received = ");
								this.ReadPostArgs(JSON.parse(body), args);
								this.ProcessRequest(urlPath, method, response, args);	
							}
							else
							{
								response.writeHead(413, {'Content-Type':'text/plain; charset=utf-8'});
								response.end();
								request.connection.destroy();
							}
						});
						break;
					case 'application/x-www-form-urlencoded':
					default:
						// Posted data is basically x=value&y=value format
						this.ProcessPostedBodyArgs(request, (body:string, success: boolean)=> {
							if(success)
							{
								this.ReadPostArgs(bodyParse(body), args);
								this.ProcessRequest(urlPath, method, response, args);	
							}
							else	
							{
								response.writeHead(413, {'Content-Type':'text/plain; charset=utf-8'});
								response.end();
								request.connection.destroy();								
							}							
						});
						break;
				}									
			}
			else if(method == "put")
			{
				console.log("handling put:"+request.headers['content-type']);
				switch(request.headers['content-type'])
				{
					case 'application/json':
						this.ProcessPostedBodyArgs(request, (body:string, success: boolean)=> {
							if(success)
							{
								(new DebugHelper()).DumpObject(JSON.parse(body), "JSON received = ");
								this.ReadPostArgs(JSON.parse(body), args);
								this.ProcessRequest(urlPath, method, response, args);	
							}
							else
							{
								response.writeHead(413, {'Content-Type':'text/plain; charset=utf-8'});
								response.end();
								request.connection.destroy();
							}
						});
						break;
					default:
						response.writeHead(400, {'Content-Type':'text/plain; charset=utf-8'});
						response.end("Content-Type not supported");
						request.connection.destroy();
						break;
				}									
			}
			else if(method == "delete")
			{
				console.log("handling delete:"+request.headers['content-type']);
				switch(request.headers['content-type'])
				{
					case 'application/json':
						this.ProcessRequest(urlPath, method, response, args);
						break;
					default:
						response.writeHead(400, {'Content-Type':'text/plain; charset=utf-8'});
						response.end("Content-Type not supported");
						request.connection.destroy();
						break;
				}									
			}			
			
		}
		
	}
	
	// Read the arguments appended to the end of the Url
	// e.g. http://localhost/somepage?productid=22&price=2.33
	// These are added to the args as "productid" and "price".
	private ReadUrlArgs(urlArgs: any, args: KeyValuePairs): void
	{
		Object.keys(urlArgs).forEach((key:string) => {
			args[key] = urlArgs[key];
			console.log("Route Url arg " + key + "=" + args[key]);
		});
	}
	
	// Read the values passed in the HTTP Request body
	// For example, when a HTML form is submitted with
	// method="POST". Also used for REST Service POST, 
	// PUT and PATCH
	private ProcessPostedBodyArgs(request:IncomingMessage, callback:(body: string, success: boolean) => void): void
	{
		let body: string = "";
		request.on('data', (chunk)=> {
			body += chunk.toString();
			
			// Handle a flood attack
			// https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js
			if(body.length > 1e6)
			{
				callback("", false);
			}
		});
		request.on('end', ()=> {
			callback(body, true);
		});			
	}
	
	// https://community.arubanetworks.com/t5/Security/TUTORIAL-How-to-generate-TLS-certificates-for-Linux-using-the/td-p/149236
	private ReadPostArgs(bodyArgs: any, args: KeyValuePairs): void
	{
		Object.keys(bodyArgs).forEach((key:string) => {
			args[key] = bodyArgs[key];
			console.log("Route body arg " + key + "=" + args[key]);
		});
	}
	
	// Data can also be loaded using a multipart format.
	private ProcessMultipartUpload(request:IncomingMessage, callback:(err: Error|null, details: UploadDetails) => void): void
	{
		const form: IncomingForm  = new IncomingForm();
		
		form.uploadDir = this._uploadDir;
		form.encoding = this._uploadEncoding;
		form.keepExtensions = true;		// Keep file extensions
		//form.maxFieldsSize = 20 * 1024 * 1024;	// Default size is 20MB
		//form.maxFileSize = 200 * 1024 * 1024;  	// Default size is 200MB
		//form.maxFields = 1000;  					// 0 unlimited, default 1000
		
		// You can use the 'fileBegin' event if you want to 
		// stream the file to somewhere else while buffering 
		// the upload on the file system
		// form.on('fileBegin', function(name, file) {
		// });

		form.parse(request, (err, fields, files) => {
			callback(err, { fields, files });
		});
	}
	
	// If the HTTP GET Request provides a file extension
	// we can just return that file.
	// If you want to parse the file first e.g. like PHP
	// parse its pages into HTML, then you will need to
	// add a route and do this yourself.
	private ProcessGetRequest(url: string, method: string, response:ServerResponse, data: any): boolean
	{
		// If a "get" the we may just be reading a file e.g.
		// a .html, .js, .css, etc.
		let ext: string = fsExtName(url);
		if(ext.length > 0)
		{
			console.log("Need to read file: " + ext);
			
			// Is this a supported type?
			if(WebServer._fileTypes.hasOwnProperty(ext))
			{
				console.log("Type is supported " + ext);
				// Extract virtual directory
				let filename: string = fsBaseName(url);
				let sep: string[] = WebServer._fileTypes[ext].split('#', 2);
				let contentType: string = sep[0];
				let vPath: string = fsCreatePath(sep[1], filename);
				console.log("Content-Type: " + contentType
					+ " virtualpath: " + vPath);
									
				this.ReturnFile(vPath, contentType, response);
				return true;
			}
		}
	
		// Needs to be handled by the router. 		
		return false;
	}
	
	// Process the HTTP Request
	// Find the matching route or the router will
	// just give us the default one.
	private ProcessRequest(url: string, method: string, response:ServerResponse, data: any): void
	{
		let route: Route = this._router.FindRoute(url, method, data);

		console.log("Found route " + route.url);
		(new DebugHelper()).DumpObject(data, "Args are:");

		// If the route has a callback function then
		// call it now.
		if(typeof route.action === "function")
		{
			if(route.action(url, response, data) == true)
			{
				// The callback returns true if we should
				// end the response implicitly.
				response.end();
			}
		}
		else
		{
			// If the route contains a name string then
			// return the HTML page. Note: filename provided
			// does not need a file extension i.e. "hello" not
			// "hello.html". In a later set of changes, an
			// application controller might be added to lookup
			// the correct filename meaning we can isolate
			// the clientside from the serverside.
			this.ReturnPage(route.action, response);
		}	
	}
	
	// Return a HTML page to the browser
	private ReturnPage(pageName: string, response:ServerResponse): void
	{
		console.log("Looking for html page.... " + pageName);

		// Read page
		let promise: Promise<Buffer> = this._pagesDir.ReadHtmlFile(pageName);
		
		promise.then((data: Buffer):void => {
			response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
			response.end((<Buffer>data).toString());			
		}).catch((error: Error):void => {
			console.log(error.message);	
			response.end();
		});	
	}
	
	// Return a file to the browser e.g. a JavaScript file
	private ReturnFile(filename: string, contentType: string, response:ServerResponse): void
	{
		console.log("Looking for file.... " + filename);

		// Read the file
		let promise: Promise<Buffer> = this._pagesDir.ReadFile(filename);
		
		promise.then((data:Buffer):void => {
			response.writeHead(200, {'Content-Type': contentType});
			response.end((<Buffer>data).toString());
		}).catch((error: Error):void => {
			console.log(error.message);	
			response.end();
		});	
	}
	
	// Setup the initial default route to display 404 page
	// not found if no matching route is discovered.
	// You can change this on the router.
	private InitDefaultRoute(): void
	{
		this._router.AddDefaultRoute((url: string, response: ServerResponse, data?: KeyValuePairs):boolean => {
			// Set the HTTP header information
			response.statusCode = 404;
			response.setHeader('Content-Type', 'text/plain; charset=utf-8');
			response.setHeader('Cache-Control', 'no-store');

			// End the response to send it back to the client
			response.write('No matching route found for url:' + url + '\n');
			return true;
		});
	}
	
	// Example implementation which demonstrates how
	// TypeScript classes can be associated to a URI.
	// This is a simple implementation, where the last
	// part of the URI represents the name of the page controller
	// e.g. http://localhost/myapp/pages/index when "index"
	// becomes the name of the page controller "indexpagecontroller".
	// We look in the _pageControllersDir for indexpagecontroller.js
	// and import it (i.e. load the file as module). We assume
	// the file exports a default class that implements IPageController
	// e.g. export default class IndexPageController implements IPageController
	// Then we call the Load() method on this class.
	// A similar approach could be used to build your own
	// MVC framework by looking for a controller and action name
	// e.g. url = url + "/$controller/$action"
	SetupPageControllers(url: string, controllersDir?: string): void
	{
		if(controllersDir !== undefined) this._pageControllersDir = controllersDir;
		
		// Setup the URL to extract the page controller name
		// from the end of the URL
		url = url + "/$page";
		
		this._router.AddRoute(url, "GET", (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			let controllerName: string = data["page"] + "pagecontroller";
			import(fsCreatePath(__dirname, this._pageControllersDir, controllerName)).then((c: any) => {
				// Import the default class from the module
				let pgController: IPageController = new c.default();
				pgController.Load(data, response);
			});

			return false;
		});
	}		
}	

export interface UploadDetails {
	fields: KeyValuePairs,
	files: FormidableFiles
}







