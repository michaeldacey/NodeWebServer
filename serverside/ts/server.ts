import { 
	WebServer, 
	UploadDetails
} from './webserver';

import {
	Router
} from './router';

import {
	KeyValuePairs
} from './keyvaluepairs';

import {
	JsonPatch,
	PatchOperation
} from './jsonpatch';

import {
	basename as pathBaseName
} from 'path';

import * as process from 'process';

import { 
	ServerResponse
} from 'http';

import {
	inspect
} from 'util';

var md5 = require('md5');

// Use JWT (JSON Web Token) for authentication of REST Web Service
// https://medium.com/dev-bits/a-guide-for-adding-jwt-token-based-authentication-to-your-single-page-nodejs-applications-c403f7cf04f4

class WebPageProcess
{
	private _hostname: string = process.env["SERVER_IP_ADDRESS"] || '127.0.0.1';	// In local computer
	private _port: number = 1339;
	private _messages: string[] = [
		"message one",
		"message two",
		"message three"
	];
	private _students: {name:string, age:number, course:string}[] = [];
	
	private _testData: { num: number } = { num: 0 };
		
	Start(): void
	{
		let router: Router = new Router();
		let server: WebServer = new WebServer(this._hostname, this._port, router, "./clientside/html");
		
		//*******************************************************
		// Quick test to display "Hi There"
		//*******************************************************
		router.AddRoute('/hi', 'GET', (url: string, response: ServerResponse):boolean => {
			response.setHeader('Cache-Control', 'no-store');
			response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
			response.write(`
			<!doctype html>
			<html>
			<body>
				<p>Hi There</p>
			</body>
			</html>`);			
			return true;
		});
		
		//*******************************************************
		// Display a HTML form
		// The results are output in the node.js console window
		//*******************************************************
		router.AddRoute('/showform', 'GET', (url: string, response: ServerResponse):boolean => {
			response.setHeader('Cache-Control', 'no-store');
			response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });

			response.write(`
			<!doctype html>
			<html>
			<body>
				<form action="/processform" method="post">
					<input type="text" name="name" /><br />
					<input type="number" name="age" /><br />
					<input type="submit" value="Save" />
				</form>
			</body>
			</html>`);
			return true;
		});
		router.AddRoute('/processform', 'POST', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			console.log("Got response");
			let i: string;
			for(i in data)
			{
				console.log("Form received " + i + "=" + data[i]);
			}
			return true;
		});
		
		//*******************************************************
		// Display the hello.html file
		//*******************************************************
		router.AddRoute('/hello', 'GET', 'hello');
		
		//*******************************************************
		// Display the fileupload.html file
		// The results files to be uploaded...we just echo
		// back to the user that they have been uploaded
		// to the upload directory specified in the WebServer
		//*******************************************************
		router.AddRoute('/upload', 'GET', 'fileupload');
		router.AddRoute('/upload', 'POST', (url: string, response: ServerResponse, data: UploadDetails):boolean => {
			console.log("Got upload response");
			response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
			response.write('received upload:\n\n');
			response.end(inspect({ fields: data.fields, files: data.files }));	
			return false;  // Ended response already
		});
		
		//*******************************************************
		// Demo of extracting values from the URI
		//*******************************************************
		router.AddRoute('/some/data/$age:int/price/$price/name/$name:string', 'GET', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			console.log("reading data");
			let i: string;
			for(i in data)
			{
				console.log("Data received " + i + "=" + data[i]);
			}
			response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
			response.write('received url data:<br/>');
			for(i in data)
			{
				response.write('<br/>'+i+' = '+data[i]);
			}
			return true;
		});
		
		//*******************************************************
		// Display the ajaxtest.html page.
		// The AJAX POST request adds a message to an array
		// and the AJAX GET request reads a message
		//*******************************************************
		router.AddRoute('/ajax', 'GET', 'ajaxtest');
		router.AddRoute('/messages/read/$msgid:int', 'GET', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			// NOTE: the last part of the url sent by the browser
			// contains the ID of the message to be read. This has
			// already been extracted for us and placed in the "data"
			// object passed to this callback. It can be simply
			// read using data.msgid
			// e.g. let id: int = data.msgid;

			console.log("reading message at id = "+data['msgid']);
			response.writeHead(200, { 'content-type': 'application/json' });
			
			console.log("Number of messages in array is " + this._messages.length);
			// This is not a niceway of converting JSON to a string.
			// Best to use Newtonsoft.JSON or some other package
			// e.g. let json: string = JSON.stringify({ x: 5, y: 6 });
			response.write('{"msg":"'+this._messages[data.msgid]+'"}');
			return true;
		});
		
		router.AddRoute('/messages/add', 'POST', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			// NOTE: The JSON posted to the server by the browser
			// has been parsed and is contained in the "data" object
			// passed to this callback i.e. {"msg":"Hello world"} 
			// can now be simply read using data.msg 
			// e.g. let message: string = data.msg;
			
			let msgIndex: number;
			
			console.log("Adding new message = "+data.msg);
			response.writeHead(200, { 'content-type': 'application/json' });
			
			this._messages.push(data.msg);
			msgIndex = this._messages.length - 1; // Added to end of array
			console.log("Number of messages now in array is " + this._messages.length);
			
			// This is not a niceway of converting JSON to a string.
			// Best to use Newtonsoft.JSON or some other package
			// e.g. let json: string = JSON.stringify({ x: 5, y: 6 });
			response.write('{"done":"true","msgid":'+msgIndex+'}');
			return true;
		});

		//*******************************************************
		// Demo displays the studentexample.html page
		// which uses AJAX to create, read, update, delete
		// and patch student data 
		//*******************************************************
		router.AddRoute('/studentpage', 'GET', 'studentexample');		
		router.AddRoute('/students/add', 'POST', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			// NOTE: The JSON posted to the server by the browser
			// has been parsed and is contained in the "data" object
			// passed to this callback 			
			let studentIndex: number;
			let result: { done: boolean, studentid: number };
			
			console.log("Adding new student = "+data.name+":"+data.age+":"+data.course);
			response.writeHead(200, { 'content-type': 'application/json' });
			
			this._students.push(
			{
				name: data.name,
				age: data.age,
				course: data.course
			});
			studentIndex = this._students.length - 1; // Added to end of array
			console.log("Number of students now in array is " + this._students.reduce((accum, curr)=>{if(curr!==undefined) accum++; return accum;}, 0));
			
			result = { done: true, studentid: studentIndex };
			response.write(JSON.stringify(result));
			return true;
		});
		
		router.AddRoute('/students/read/$studentid:int', 'GET', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			console.log("reading student at id = "+data['studentid']);
			response.writeHead(200, { 'content-type': 'application/json' });
			
			console.log("Number of students now in array is " + this._students.reduce((accum, curr)=>{if(curr!==undefined) accum++; return accum;}, 0));
			if(typeof this._students[data.studentid] != "undefined")
				response.write(JSON.stringify({done:true, student:this._students[data.studentid]}));
			else
				response.write(JSON.stringify({done:false}));
			return true;
		});
		
		router.AddRoute('/students/read', 'GET', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			console.log("reading students");
			response.writeHead(200, { 'content-type': 'application/json' });
			
			console.log("Number of students now in array is " + this._students.reduce((accum, curr)=>{if(curr!==undefined) accum++; return accum;}, 0));
			response.write(JSON.stringify(this._students.filter(s => typeof s != "undefined")));
			return true;
		});
		
		router.AddRoute('/students/put/$studentid:int', 'PUT', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			// NOTE: The JSON posted to the server by the browser
			// has been parsed and is contained in the "data" object
			// passed to this callback 			
			let result: { done: boolean, studentid: number };
			
			console.log("Editing new student = "+data.name+":"+data.age+":"+data.course);
			response.writeHead(200, { 'content-type': 'application/json' });
			
			// A PUT is intended to replace all the content,
			// use PATCH to change individual student fields.
			this._students[data.studentid] = {
				name: data.name,
				age: data.age,
				course: data.course
			};
			
			console.log("Number of students now in array is " + this._students.reduce((accum, curr)=>{if(curr!==undefined) accum++; return accum;}, 0));			
			result = { done: true, studentid: data.studentid };
			response.write(JSON.stringify(result));
			return true;
		});
		
		router.AddRoute('/students/delete/$studentid:int', 'DELETE', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {		
			let result: { done: boolean, studentid: number };
			
			console.log("Removing a student = "+data.studentid);
			response.writeHead(200, { 'content-type': 'application/json' });
			
			// I am not splicing because I am trying to keep
			// the "studentid" values the same after students
			// are removed.
			//this._students.splice(data.studentid, 1);
			delete this._students[data.studentid];
			console.log("Number of students now in array is " + this._students.reduce((accum, curr)=>{if(curr!==undefined) accum++; return accum;}, 0));
			
			result = { done: true, studentid: data.studentid };
			response.write(JSON.stringify(result));
			return true;
		});
		
		router.AddRoute('/students/patch/$studentid:int', 'PATCH', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			// NOTE: The JSON posted to the server by the browser
			// has been parsed and is contained in the "data" object
			// passed to this callback 			
			let result: { done: boolean, studentid: number };
			response.writeHead(200, { 'content-type': 'application/json' });

			console.log("Handling patch %o", data);
			// Strictly speaking all operations must succeed or the
			// PATCH Request is considered a failure and no changes
			// should be made.
			// THIS IS AN EXERCISE FOR THE READER
			console.log("\n************************************************\n"
					+ 	"WARNING: Patch changes should be made on an ALL \n"
					+ 	"or NONE basis. If an error occurs then no\n"
					+ 	"changes should be made. However, this code has\n"
					+	"NOT been provided.\n"
					+ 	"************************************************");
			
			// NOTE: I'm over complicating this because you
			// would only use one PATCH method, but I am
			// demonstrating all 3 here so I need to figure
			// out the method that was used based on the
			// content-type.
			if(data['content-type'] === 'application/json')
			{
				// Patching is not well defined, so this
				// is a reasonable and pragmatic approach,
				// where we just send a JSON document with
				// the fields we want to update.
				this.SimplePatchStudent(data.studentid, "name", data);
				this.SimplePatchStudent(data.studentid, "age", data);
				this.SimplePatchStudent(data.studentid, "course", data);
			}
			else if(data['content-type'] === 'application/json-patch+json')
			{
				let actions: JsonPatch[] = data['patch-actions'];

				// For JSON Doc RFC6902 we have to checked
				// the paths (JSON pointers) are valid.
				// Here is the list of the valid ones.
				let paths: string[] = [ "/name", "/age", "/course", "/testing" ];
				
				// RFC6902: actions should be performed sequentially
				// in the order they appear in the array.
				for(let i in actions)
				{
					let action: JsonPatch = actions[i];
					if(paths.includes(action.Target))
					{
						this.PatchStudent(data.studentid, action);						
					}					
				}
			}
			else if(data['content-type'] === 'application/merge-patch+json')
			{
				let actions: JsonPatch[] = data['patch-actions'];

				// For JSON Merge Patch RFC7396 we need to merge
				// a JSON patch document with a JSON target document.
				// However, the webserver could I have provided
				// converts merge document into the operations
				// MERGE meaning add or update as appropriate and
				// REMOVE meaning remove the field.
				// Here is the list of the valid paths.
				let paths: string[] = [ "/name", "/age", "/course" ];
				
				for(let i in actions)
				{
					let action: JsonPatch = actions[i];
					if(paths.includes(action.Target))
					{
						this.MergePatchStudent(data.studentid, action);						
					}					
				}
			}	
			
			console.log("Number of students now in array is " + this._students.reduce((accum, curr)=>{if(curr!==undefined) accum++; return accum;}, 0));			
			result = { done: true, studentid: data.studentid };
			response.write(JSON.stringify(result));
			return true;
		});	

		
		//*******************************************************
		// HTTP Conditional Requests
		// ==========================
		// Return an Entity Tag (ETag) that can
		// identify if the data has been changed
		// since it was generated.
		// Here we create a one-way hash over the
		// the JS object. Other approaches are to
		// use timestamps or version numbers.
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests
		// https://blog.risingstack.com/10-best-practices-for-writing-node-js-rest-apis/
		//*******************************************************		
		router.AddRoute('/condreq', 'GET', 'condreqtest');		
		router.AddRoute('/condreq/add', 'POST', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			console.log("Conditional Request: ADD");
			
			// NOT adding, just setting the value
			// because I am just playing with
			// conditional requests
			this._testData.num = data["testnum"];
	
			// No data to return so do not add a content-type header
			response.writeHead(200, {
				'ETag': md5(JSON.stringify(this._testData))
			});
			return true;
		});	

		router.AddRoute('/condreq/read', 'GET', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			console.log("Conditional Request: READ");
			
			// Read the data.
			// Return the new ETag value because this
			// now the data state the client knows.
			let json: string = JSON.stringify(this._testData);
			response.writeHead(200, {
				'content-type': 'application/json',
				'ETag': md5(json)
			});
			response.write(json);
			return true;
		});	

		router.AddRoute('/condreq/put', 'PUT', (url: string, response: ServerResponse, data: KeyValuePairs):boolean => {
			console.log("Conditional Request: PUT");
			
			// Client should send "If-Match" header with
			// ETag from the last read it performed i.e. what
			// it thinks is the current state of the data.
			let clientETag: string = data['if-match'];
			let currentETag: string = md5(JSON.stringify(this._testData));
			let json: string;
			let result: { done: boolean };
			
			// Here we are assuming that the patch operation
			// is non-idempotent i.e. the value could be
			// corrupted if the client sends a modification
			// of a value that has already been changed by
			// a second client.
			// Actually, in this case we are just changing
			// a number so this is not true.
			// But we check that the previous version of the
			// number (i.e. value) has been changed since
			// the client read it by comparing the hash value
			// provided by the client in the if-match header
			// with the hash of the current number.
			if(clientETag == currentETag)
			{
				// Since we are happy the client is making
				// changes to the correct version of the data
				// i.e. the number has not changed since
				// the client read it, then we can change
				// the number.
				this._testData.num = data["testnum"];
				result = { done: true }; 
				
				response.writeHead(200, {
					'content-type': 'application/json',
					'ETag': md5(JSON.stringify(this._testData))
				});
				response.write(JSON.stringify(result));				
			}
			else
			{
				json = JSON.stringify(this._testData);
				result  = { done: false }
				
				response.writeHead(412, { 'content-type': 'application/json' });
				response.write(JSON.stringify(result));
				console.log("Pre-condition failed %s != %s", clientETag, currentETag);				
			}			
			return true;
		});		

		//*******************************************************
		// Demo showing how a single page application 
		// could be built using an MVC like approach
		//*******************************************************
		router.AddRoute('/spa', 'GET', 'singlepageapp');		
		server.SetupPageControllers("/pgc", "../pagecontrollers");
					
		server.Listen();
	}
	
	private SimplePatchStudent(studentId: number, fieldname: string, data: KeyValuePairs): boolean
	{
		let success: boolean = true;
		
		// Test to see if data with this fieldname has
		// been provided. If not, then this field is
		// not being modified.
		if(typeof data[fieldname] !== 'undefined')
		{
			console.log("Patching field %s", fieldname);
			let student: any = this._students[studentId];	// Cheating here, turn off type checking!!
			
			// Make sure the field we are editing actually exists
			if(typeof student[fieldname] !== undefined)
			{					
				student[fieldname] = data[fieldname];
				console.log("Updating field %s with %o", fieldname, student[fieldname]);
			}
			else
			{
				// Failed to make requested edit
				success = false;			
			}
		}
		return success;		
	}	
	
	private PatchStudent(studentId: number, action: JsonPatch): boolean
	{
		// Extract the fieldname "name", "age", etc.
		let fieldname: string = pathBaseName(action.Target);  
		let success: boolean = false;

		console.log("Patching field %s", fieldname);
		let student: any = this._students[studentId];	// Cheating here, turn off type checking!!
		
		switch(action.Operation)
		{
			// For JS, a field is created the first time you
			// use it. Hence, create and update are identical.
			case PatchOperation.PATCH_CREATE:
				student[fieldname] = action.Value;
				success = true;
				break;
			case PatchOperation.PATCH_UPDATE:
				if(typeof student[fieldname] !== undefined)
				{					
					student[fieldname] = action.Value;
					console.log("Updating field %s with %o", fieldname, student[fieldname]);
					success = true;
				}
				break;
			case PatchOperation.PATCH_REMOVE:
				if(typeof student[fieldname] !== undefined)
				{
					// You cannot remove a field from the Student
					// object because we defined it as having one.
					// We do the next best thing, which is to clear it.
					student[fieldname] = "";
					success = true;
				}
				break;					
			case PatchOperation.PATCH_MOVE:
				console.log("MOVE Patch operation not supported");
				break;
			case PatchOperation.PATCH_COPY:
				console.log("COPY Patch operation not supported");
				break;
			case PatchOperation.PATCH_TEST:
				// The "test" operation tests that a value at the
				// target location is equal to a specified value.
				// The values are strings and numbers so we can
				// compare them quite easily.
				success = (student[fieldname] === action.Value);
				break;
			default:
				// Operation not supported
				break;
		}
		return success;		
	}
	
	private MergePatchStudent(studentId: number, action: JsonPatch): boolean
	{
		// Extract the fieldname "name", "age", etc.
		let fieldname: string = pathBaseName(action.Target);  
		let success: boolean = false;
		
		console.log("Patching field %s", fieldname);
		let student: any = this._students[studentId];	// Cheating here, turn off type checking!!
		
		switch(action.Operation)
		{
			// For JS, a field is created the first time you
			// use it. Hence, create and update are identical.
			case PatchOperation.PATCH_MERGE:
				student[fieldname] = action.Value;
				success = true;
				break;
			case PatchOperation.PATCH_REMOVE:
				if(typeof student[fieldname] !== undefined)
				{
					// You cannot remove a field from the Student
					// object because we defined it as having one.
					// We do the next best thing, which is to clear it.
					student[fieldname] = "";
					success = true;
				}
				break;					
		}
		return success;		
	}	
}

(function ()
{
	(new WebPageProcess()).Start();
})();
	



