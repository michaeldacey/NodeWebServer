//import $ from "jquery";

class CondReqTestPage
{
	// Attributes
	private _etag: string = "";
	
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
		$("#read-number-button").click(this.LoadNumberClick);
		$("#send-number-button").click(this.SendNumberClick);
		$("#edit-number-button").click(this.EditNumberClick);
	}
	
	private LoadNumberClick = (e: JQuery.Event): boolean => 
	{
		$.ajax({
			cache: false,
			type: "GET",
			url: "http://localhost:1339/condreq/read",
			data: '{}',
			contentType: "application/json",
			dataType: "json",
			success: this.NumberRead,
			error: this.AjaxError
		});
		
		e.preventDefault();		
		return false;
	};
	
	private NumberRead = (json: any, status: string, req: JQueryXHR): void =>
	{
		this._etag = req.getResponseHeader("ETag") as string;
		$("#display-number-span").html("Number read " + json.num + " with Etag: " + this._etag );		
	};
	
	private SendNumberClick = (e: JQuery.Event): boolean => 
	{
		let number: string = $("#number-text-box").val() as string;
		let jsonData: string = '{"testnum":'+number+'}';
		
		$.ajax({
			cache: false,
			type: "POST",
			url: "http://localhost:1339/condreq/add",
			data: jsonData,
			contentType: "application/json",
			//dataType: "json", no response in body is expected
			success: this.NumberStored,
			error: this.AjaxError
		});
		
		e.preventDefault();		
		return false;
	};
	
	private NumberStored = (json: any, status: string, req: JQueryXHR): void =>
	{
		this._etag = req.getResponseHeader("ETag") as string;
		$("#display-number-span").html("Number stored with Etag: " + this._etag);	
	};
	
	private EditNumberClick = (e: JQuery.Event): boolean => 
	{
		let number: string = $("#number-text-box").val() as string;
		let jsonData: string = '{"testnum":'+number+'}';
		
		$.ajax({
			cache: false,
			type: "PUT",
			url: "http://localhost:1339/condreq/put",
			data: jsonData,
			contentType: "application/json",
			dataType: "json",
			headers: { 'if-match': this._etag },
			success: this.NumberEditStored,
			error: this.AjaxError
		});
		
		e.preventDefault();		
		return false;
	};
	
	private NumberEditStored = (json: any, status: string, req: JQueryXHR): void =>
	{
		if(json.done === true)
		{
			this._etag = req.getResponseHeader("ETag") as string;
			$("#display-number-span").html("Number edited with Etag: " + this._etag);
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
	let page: CondReqTestPage = new CondReqTestPage();
	page.PageLoad();
	
	// Shorthand is (new AjaxTestPage()).PageLoad();
})();




