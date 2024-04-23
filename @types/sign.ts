import { ITask } from "./models";

export interface __secure_fgpData {
    __secure_fgp: string;
    __secure_fgpHash: string;
}

export interface IClientSignData {
    login?: string;
    email: string;
    password: string;
}

export interface IJWTPayload {
    id: number;
    login: string;
    email: string;
    type: 'admin' | 'user' | 'guest';
    tasks: ITask[],
    __secure_fgpHash: string;
    iat?: number;
    exp?: number;
}