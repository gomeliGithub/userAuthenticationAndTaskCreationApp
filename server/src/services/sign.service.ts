import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Response } from 'express';
import * as argon2 from "argon2";

import { CommonModule } from '../modules/common.module';

import { CommonService } from './common.service';

import { AppService } from '../app.service';
import { JwtControlService } from './jwt-control.service';

import { generate__secure_fgp } from './sign.generateKeys';

import { IRequest, IRequestBody } from 'types/global';
import { IClientSignData, IJWTPayload } from 'types/sign';
import { IAdmin, IUser } from 'types/models';

@Injectable()
export class SignService {
    constructor (
        private readonly _jwtService: JwtService,

        private readonly _appService: AppService,
        private readonly _jwtControlService: JwtControlService
    ) { }
    // Функция для проверки доступа к защищенным ресурсам
    public async validateClient (request: IRequest, requiredClientTypes: string[], throwError = true, commonServiceRef?: CommonService): Promise<boolean> {
        if ( !commonServiceRef ) commonServiceRef = await this._appService.getServiceRef(CommonModule, CommonService);

        if ( request.url === '/api/sign/process' ) {
            const token: string | undefined = this._jwtControlService.extractTokenFromHeader(request, false);

            const requestBody: IRequestBody = request.body;

            const clientEmail: string = ( requestBody.sign?.clientData.email as string ).trim();
            const clientPassword: string = ( requestBody.sign?.clientData.password as string ).trim();

            let validatedClientData: IAdmin | IUser | undefined = undefined;

            if ( requestBody.sign?.operation === 'in' ) validatedClientData = await this._clientSignDataValidate(commonServiceRef, request, clientEmail, clientPassword, requestBody.sign.operation);

            if ( token ) await this._jwtControlService.addRevokedToken(token);

            return true;
        } else if ( commonServiceRef ) {
            const token: string | undefined = this._jwtControlService.extractTokenFromHeader(request); 
            
            const validatedClientPayload: IJWTPayload | null = await this._jwtControlService.tokenValidate(request, token as string, throwError);
            const clientType: string | null = validatedClientPayload ? validatedClientPayload.type : null;
            const clientLogin: string | null = validatedClientPayload ? validatedClientPayload.login : null;

            const existingClientData: IAdmin[] | IUser[] | null = validatedClientPayload ? ( await commonServiceRef.getClients({ where: { login: clientLogin as string }}, 'admin' || 'user') ) : null;

            if ( !existingClientData ) {
                if ( throwError ) throw new UnauthorizedException(`${ request.url } "ValidateClient - client instance does not exists, login - ${ validatedClientPayload ? validatedClientPayload.login : '-' }"`);
                else return false;
            }

            return requiredClientTypes.some(requiredClientType => requiredClientType === clientType);
        }

        return true;
    }
    // Функция для регистрации и авторизации пользователя и авторизации администратора
    public async sign (request: IRequest, response: Response, operation: string, clientData: IClientSignData): Promise<string | void> {
        const commonServiceRef: CommonService = await this._appService.getServiceRef(CommonModule, CommonService);

        if ( operation === 'in' && request.activeClientData ) {
            const payload: IJWTPayload = {
                id: request.activeClientData.id,
                login: request.activeClientData.login,
                email: request.activeClientData.email,
                type: request.activeClientData.type as 'admin' | 'user',
                tasks: request.activeClientData.type === 'user' ? request.activeClientData.tasks : null,
                __secure_fgpHash: ""
            }
    
            const { __secure_fgp, __secure_fgpHash } = generate__secure_fgp();
    
            payload.__secure_fgpHash = __secure_fgpHash;
    
            if ( request.activeClientData.type === 'user' ) {
                await commonServiceRef.registerUserLastLoginTime(payload.login as string);
                await commonServiceRef.registerUserLastActivityTime(payload.login as string);
            }
    
            const access_token: string = this._jwtService.sign(payload, { secret: process.env.JWT_SECRETCODE });
    
            await this._jwtControlService.saveToken(access_token);
    
            response.cookie('__secure_fgp', __secure_fgp, this._appService.cookieSerializeOptions);
    
            return access_token;
        } else if ( operation === 'up' ) {
            const { login, email, password } = clientData;

            const passwordHash: string = await argon2.hash(password.trim(), { secret: Buffer.from(process.env.ARGON2_SECRETCODE as string) });

            await commonServiceRef.createUser({
                login: ( login as string ).trim(),
                password: passwordHash,
                email: email.trim(),
                type: 'user'
            });
        }
    }
    // Функция для 'гашения' текущего токена авторизованного клиента
    public async signOut (request: IRequest): Promise<void> {
        const token: string | undefined = this._jwtControlService.extractTokenFromHeader(request);

        if ( !token || token === '' ) throw new UnauthorizedException(`${ request.url } "SignOut - invalid or does not exists token"`);

        return this._jwtControlService.addRevokedToken(token);
    }
    // Функция для получения данных текущего активного клиента
    public async getActiveClient (request: IRequest): Promise<IJWTPayload | null> {
        const token: string | undefined = this._jwtControlService.extractTokenFromHeader(request);

        let validatedClientPayload: IJWTPayload | null = null;

        validatedClientPayload = await this._jwtControlService.tokenValidate(request, token ?? '', false);

        if ( !validatedClientPayload || !token || token === '' ) {
            return validatedClientPayload;
        }

        const commonServiceRef: CommonService = await this._appService.getServiceRef(CommonModule, CommonService);

        if ( validatedClientPayload ) {
            const clientData: IAdmin | IUser = ( await commonServiceRef.getClients({
                select: {
                    login: true,
                    email: true,
                    tasks: true,
                    id: false,
                    password: false,
                    type: false,
                    lastActiveDate: false,
                    lastSignInDate: false
                },
                where: { login: validatedClientPayload.login as string }
            }, 'admin' || 'user') )[0];

            if ( !clientData ) throw new UnauthorizedException(`${ request.url } "GetActiveClient - client instance does not exists"`);
        }

        validatedClientPayload.id = null;
        
        delete validatedClientPayload.exp;
        delete validatedClientPayload.iat;

        return validatedClientPayload;
    }
    // Функция для валидации пароля клиента
    private async _clientSignDataValidate (commonServiceRef: CommonService, request: IRequest, clientEmail: string, clientPassword: string, operation: string): Promise<IAdmin | IUser | undefined> {
        const clientData: IAdmin | IUser | undefined = ( await commonServiceRef.getClients({ where: { email: clientEmail }}, 'admin' || 'user') )[0];

        if ( !clientData && operation === 'in' ) throw new UnauthorizedException(`${ request.url } "_clientSignDataValidate - client instance does not exists"`);
        else if ( clientData && operation === 'up' ) throw new UnauthorizedException(`${ request.url } "_clientSignDataValidate - client instance does exists"`);

        if ( operation === 'in' ) {
            const passwordIsValid: boolean = await argon2.verify(clientData.password, clientPassword, { secret: Buffer.from(process.env.ARGON2_SECRETCODE as string) });

            if ( !passwordIsValid ) throw new UnauthorizedException(`${ request.url } "_clientSignDataValidate - client password invalid"`);
        }

        return clientData;
    }
}