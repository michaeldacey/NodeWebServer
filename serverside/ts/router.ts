import { 
	ServerResponse
} from 'http';

import {
	KeyValuePairs
} from './keyvaluepairs';

import {
	UrlComparator
} from './urlcomparator';

export class Router
{
	// Attributes
	private _routes: Route[];
	private _compare: UrlComparator;
	
	// Constructor
	constructor()
    {
		this._routes = [];
		this._compare = new UrlComparator();
    }
	
	// Properties
	
	// Methods
	AddDefaultRoute(callback: RouteCallback): void
	AddDefaultRoute(filename: string): void
	AddDefaultRoute(action?: any): void
	{
		this._routes[0] = { url:'/', method:'ANY', action:action };
	}
	
	AddRoute(url: string, method: string, callback: RouteCallback): void
	AddRoute(url: string, method: string, filename: string): void
	AddRoute(url: string, method: string, action?: any): void
	{
		this._routes.push({
			url, method, action
		});
	}
	
	FindRoute(url: string, method: string, args: KeyValuePairs): Route
	{
		
		method = method.toLowerCase();
		for(let i = 1; i < this._routes.length; i++)
		{
			let route: Route = this._routes[i];
			let routeMethod: string = route.method.toLowerCase();
			console.log("Search route " + route.url + "==" + url + " method " + routeMethod + "==" + method);
					
			if(this._compare.CompareRouteUrl(url, route.url, args) 
			&& (routeMethod == "any"
			|| (routeMethod == method)))
			{
				return route;
			}
		}
		
		// Return the default route
		return this._routes[0];
	}
}	

export interface RouteCallback
{
	(url: string, response: ServerResponse, data: any): boolean
}

export interface Route
{
	url: string;
	method: string;
	action: RouteCallback | string;
}


