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

import * as process from 'process';


import { 
	ServerResponse
} from 'http';

import {
	inspect
} from 'util';

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
		
	Start(): void
	{
		let router: Router = new Router();
		let server: WebServer = new WebServer(this._hostname, this._port, router, "./clientside/html");
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
			console.log("Got reponse");
			let i: string;
			for(i in data)
			{
				console.log("Form received " + i + "=" + data[i]);
			}
			return true;
		});
		router.AddRoute('/hello', 'GET', 'hello');
		router.AddRoute('/upload', 'POST', (url: string, response: ServerResponse, data: UploadDetails):boolean => {
			console.log("Got upload reponse");
			response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
			response.write('received upload:\n\n');
			response.end(inspect({ fields: data.fields, files: data.files }));	
			return false;  // Ended response already
		});
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
			
			// A PUT is intended to replace all content-type
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

		router.AddRoute('/spa', 'GET', 'singlepageapp');
		
		server.SetupPageControllers("/pgc", "../pagecontrollers");
					
		server.Listen();
	}
}

(function ()
{
	(new WebPageProcess()).Start();
})();
	



