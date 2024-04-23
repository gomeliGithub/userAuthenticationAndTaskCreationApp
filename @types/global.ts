import { Request } from "express";

import { IClientSignData } from "./sign";
import { IAdmin, IUser } from "./models";

export interface IRequest extends Request {
    session: null;
    activeClientData?: IAdmin | IUser;
}

export interface IRequestBody {
	sign?: {
        operation: string;
		clientData: IClientSignData;
    }
}

export interface ICookieSerializeOptions {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    priority?: 'low' | 'medium' | 'high';
    sameSite?: boolean | 'lax' | 'none' | 'strict';
    secure?: boolean;
}

export interface IAlert {
	type: 'success' | 'warning' | 'danger';
	message: string;
	closeTimeout: number;
}