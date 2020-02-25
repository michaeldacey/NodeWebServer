//import $ from "jquery";

class AjaxTestPage
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
		$("#read-msg-button").click(this.LoadMessageClick);
		$("#send-msg-button").click(this.SendMessageClick);
	}
	
	private LoadMessageClick = (e: JQuery.Event): boolean => 
	{
		let msgid: number = parseInt($("#msgid-text-box").val() as string, 10);
		
		$.ajax({
			cache: false,
			type: "GET",
			url: "http://localhost:1339/messages/read/"+msgid,
			data: '{}',
			contentType: "application/json",
			dataType: "json",
			success: this.MessageRead,
			error: this.AjaxError
		});
		
		e.preventDefault();		
		return false;
	};
	
	private MessageRead = (json: any, status: string, req: JQueryXHR): void =>
	{
		$("#display-msg-span").html(json.msg);		
	};
	
	private SendMessageClick = (e: JQuery.Event): boolean => 
	{
		let msg: string = $("#msg-text-box").val() as string;
		let jsonMsgData: string = '{"msg":"'+msg+'"}';
		
		$.ajax({
			cache: false,
			type: "POST",
			url: "http://localhost:1339/messages/add",
			data: jsonMsgData,
			contentType: "application/json",
			dataType: "json",
			success: this.MessageAdded,
			error: this.AjaxError
		});
		
		e.preventDefault();		
		return false;
	};
	
	private MessageAdded = (json: any, status: string, req: JQueryXHR): void =>
	{
		if(json.done === "true")
		{
			$("#display-msg-span").html("Message added at index "+json.msgid);
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
	let page: AjaxTestPage = new AjaxTestPage();
	page.PageLoad();
	
	// Shorthand is (new AjaxTestPage()).PageLoad();
})();




