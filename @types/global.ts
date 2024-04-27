import { Request } from "express";

import { IClientSignData, IJWTPayload } from "./sign";

export interface IRequest extends Request {
    session: null;
    activeClientData?: IJWTPayload;
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