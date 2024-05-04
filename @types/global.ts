import { Request } from "express";

import { IClientSignData, IJWTPayload } from "./sign";
import { ITask, IUser } from "./models";

export interface IRequest extends Request {
    session: null;
    activeClientData?: IJWTPayload;
}

export interface IRequestBody {
	sign?: {
        operation: string;
		clientData: IClientSignData;
    },
    client?: {
        userLogin?: string;
        userPassword?: string;
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

export interface IGetUsersData {
    users: IUser[];
    moreUsersAreExists: boolean;
}

export interface IActiveClientData {
    login: string;
    email: string;
    tasks: ITask[] | null;
}

export interface IAlert {
	type: 'success' | 'warning' | 'danger';
	message: string;
	closeTimeout: number;
}

export type SortColumn = keyof IUser | '';
export type SortDirection = 'asc' | 'desc' | '';

export interface SortEvent {
    column: SortColumn;
	direction: SortDirection;
}

export interface SearchResult {
	users: IUser[];
	total: number;
}

export interface State {
	searchTerm: string;
	sortColumn: SortColumn;
	sortDirection: SortDirection;
}