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
    id: number | null;
    login: string | null;
    email: string | null;
    type: 'admin' | 'user' | 'guest';
    tasks: ITask[] | null,
    __secure_fgpHash?: string;
    iat?: number;
    exp?: number;
}