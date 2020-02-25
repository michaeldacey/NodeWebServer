import { ServerResponse } from 'http';

export interface IPageController
{
    Load(data: any, response:ServerResponse): void;
}
