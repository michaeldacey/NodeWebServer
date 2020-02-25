import $ from "jquery";

// You have to export something for webpack to bundle it!!
export class App
{
	// Attributes
	
	// Constructor
	constructor()
    {
    }
	
	
	// Properties
	
	// Methods
	static Main(): void
	{
		window.alert("App is running");
	}
}	

// Self-invoking function
(function() {
	App.Main();
})();




