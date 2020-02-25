import {IPageController} from '../ts/ipagecontroller';
import { ServerResponse } from 'http';

export default class FirstPageController implements IPageController
{
    Load(data: any, response:ServerResponse): void 
	{
        console.log("First page controller loading...");
		response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
		response.end("Hello this is the first page");
    }
}

