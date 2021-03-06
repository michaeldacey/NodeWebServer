//import $ from "jquery";

class StudentExamplePage
{
	// Attributes
	
	// Constructor
	constructor()
    {
		$.ajaxSetup({cache:false});	// May need to turn of browser cache
    }
	
	// Properties
	
	// Methods
	PageLoad(): void
	{
		// Add event handlers to buttons, etc.
		$("#readall-student-button").click(this.LoadAllStudentClick);	
		$("#read-student-button").click(this.LoadStudentClick);
		$("#add-student-button").click(this.AddStudentClick);
		$("#put-student-button").click(this.PutStudentClick);
		$("#patch-student-button").click(this.PatchStudentClick);
		$("#delete-student-button").click(this.DeleteStudentClick);
	}
	
	private LoadAllStudentClick = (e: JQuery.Event): boolean => 
	{
		$.ajax({
			cache: false,
			type: "GET",
			url: "http://localhost:1339/students/read",
			data: '{}',
			contentType: "application/json",
			dataType: "json",
			success: this.StudentReadAll,
			error: this.AjaxError
		});

		e.preventDefault();
		return false;
	};
	
	private StudentReadAll = (students: {name:string, age:number, course:string}[], status: string, req: JQueryXHR): void =>
	{
		let rows: string = "";
		for(let i in students)
		{
			let student: {name:string, age:number, course:string} = students[i];
			
			rows += `<tr><td>Name</td><td>${student.name}</td></tr>
					<tr><td>Age</td><td>${student.age}</td></tr>
					<tr><td>Course</td><td>${student.course}</td></tr>`;
		}
		
		$("#display-student-div").html(`<table>${rows}</table>`);		
	};
	
	private LoadStudentClick = (e: JQuery.Event): boolean => 
	{
		let studentid: number = parseInt($("#studentid-text-box").val() as string, 10);
		
		$.ajax({
			cache: false,
			type: "GET",
			url: "http://localhost:1339/students/read/"+studentid,
			data: '{}',
			contentType: "application/json",
			dataType: "json",
			success: this.StudentRead,
			error: this.AjaxError
		});

		e.preventDefault();
		return false;
	};
	
	private StudentRead = (json: {done:boolean, student:{name:string, age:number, course:string}}, status: string, req: JQueryXHR): void =>
	{
		if(json.done == true)
		{
			$("#display-student-div").html(`<table>
			<tr><td>Name</td><td>${json.student.name}</td></tr>
			<tr><td>Age</td><td>${json.student.age}</td></tr>
			<tr><td>Course</td><td>${json.student.course}</td></tr>
			</table>`);	
		}	
		else
		{
			$("#display-student-div").html(`<p>No matching student</p>`)
		}	
	};
	
	private AddStudentClick = (e: JQuery.Event): boolean => 
	{
		let student: {name:string, age:number, course:string};
		
		student = {
			name: $("#student-name-text-box").val() as string,
			age: parseInt($("#student-age-text-box").val() as string),
			course: $("#student-course-text-box").val() as string
		};

		$.ajax({
			cache: false,
			type: "POST",
			url: "http://localhost:1339/students/add",
			data: JSON.stringify(student),
			contentType: "application/json",
			dataType: "json",
			success: this.StudentAdded,
			error: this.AjaxError
		});

		e.preventDefault();
		return false;
	};
	
	private StudentAdded = (json: any, status: string, req: JQueryXHR): void =>
	{
		if(json.done === true)
		{
			$("#student-opstatus-span").html("Student added at index "+json.studentid);
		}		
	};
	
	private PutStudentClick = (e: JQuery.Event): boolean => 
	{
		let student: {name:string, age:number, course:string};
		let studentid: number;
		
		student = {
			name: $("#student-name-text-box").val() as string,
			age: parseInt($("#student-age-text-box").val() as string),
			course: $("#student-course-text-box").val() as string
		};
		
		studentid = parseInt($("#studentid-text-box").val() as string);

		$.ajax({
			cache: false,
			type: "PUT",
			url: "http://localhost:1339/students/put/"+studentid,
			data: JSON.stringify(student),
			contentType: "application/json",
			dataType: "json",
			success: this.StudentEditPut,
			error: this.AjaxError
		});

		e.preventDefault();
		return false;
	};
		
	private StudentEditPut = (json: any, status: string, req: JQueryXHR): void =>
	{
		if(json.done === true)
		{
			$("#student-opstatus-span").html("Student edited (put) at index "+json.studentid);
		}		
	};
	
	private PatchStudentClick = (e: JQuery.Event): boolean => 
	{
		let enteredName: string = $("#student-name-text-box").val() as string;
		let enteredAge: number = parseInt($("#student-age-text-box").val() as string);
		let enteredCourse: string = $("#student-course-text-box").val() as string;
		let studentid: number = parseInt($("#studentid-text-box").val() as string);
		let contenttype: string;
		let studentChanges: any = {};
			
		switch($( "#patch-mode option:selected" ).text())
		{
			case "jsonpatch":
				contenttype = "application/json-patch+json";
				studentChanges = [];
				// Operations are executed in the order they are pushed,
				// which make little difference in this example.
				studentChanges.push(this.StudentPatchReplaceOp(studentid, "name", enteredName));
				studentChanges.push(this.StudentPatchReplaceOp(studentid, "age", enteredAge));
				studentChanges.push(this.StudentPatchReplaceOp(studentid, "course", enteredCourse));			
				break;
			case "jsonmerge":
				contenttype = "application/merge-patch+json";
				studentChanges = {
					name: enteredName,
					age: enteredAge,
					course: enteredCourse
				};
				break;
			case "json":
			default:
				contenttype = "application/json";
				studentChanges = {
					name: enteredName,
					age: enteredAge,
					course: enteredCourse
				};
				break;			
		}
	
		$.ajax({
			cache: false,
			type: "PATCH",
			url: "http://localhost:1339/students/patch/"+studentid,
			data: JSON.stringify(studentChanges),
			contentType: contenttype,
			dataType: "json",
			success: this.StudentEditPatch,
			error: this.AjaxError
		});

		e.preventDefault();
		return false;
	};
	
	// Patch operation to replace a stored value
	private StudentPatchReplaceOp(studentid: number, fieldname: string, newvalue: any): any
	{
		let jsonPointer: string; // Should point to JSON document fragment (field)
		
		// Remember the URI selects the students array element
		// i.e. the resource to be modified.
		// The JSON pointer selects the field within that resource
		// that needs modifying. Strictly speaking, the resource
		// being modified should be a JSON document.
		// So "/" represents the selected resource which in our case
		// represents the JS object selected by the studentid in the URI.
		// https://erosb.github.io/post/json-patch-vs-merge-patch/
		jsonPointer = "/" + fieldname;
		
		return {
			op: "replace",
			path: jsonPointer,
			value: newvalue
		};
	}
	
	private StudentEditPatch = (json: any, status: string, req: JQueryXHR): void =>
	{
		if(json.done === true)
		{
			$("#student-opstatus-span").html("Student edited (put) at index "+json.studentid);
		}		
	};
	
	private DeleteStudentClick = (e: JQuery.Event): boolean => 
	{
		let studentid: number;
		
		studentid = parseInt($("#studentid-text-box").val() as string);

		$.ajax({
			cache: false,
			type: "DELETE",
			url: "http://localhost:1339/students/delete/"+studentid,
			data: '{}',
			contentType: "application/json",
			dataType: "json",
			success: this.StudentDelete,
			error: this.AjaxError
		});

		e.preventDefault();
		return false;
	};
	
	private StudentDelete = (json: any, status: string, req: JQueryXHR): void =>
	{
		if(json.done === true)
		{
			$("#student-opstatus-span").html("Student deleted at index "+json.studentid);
		}		
	};
	
	private AjaxError = (req: JQueryXHR, status: string, error: string): void =>
	{
		window.alert("Ajax Error --"+"\n"+
		 "status: "+status+"\n"+
		 "RdyStatus: "+req.readyState+"\n"+
		 "Message: "+req.statusText);
	};
}	

// Self-invoking function
(function() {
	let page: StudentExamplePage = new StudentExamplePage();
	page.PageLoad();
	
	// Shorthand is (new StudentExamplePage()).PageLoad();
})();




