import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Admins, Prisma, Users } from '@prisma/client';

import { Response } from 'express';
import * as bcrypt from 'bcrypt';

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

    public async validateClient (request: IRequest, requiredClientTypes: string[], throwError = true, commonServiceRef?: CommonService): Promise<boolean> {
        const token: string | undefined = this._jwtControlService.extractTokenFromHeader(request); 

        if ( !commonServiceRef ) commonServiceRef = await this._appService.getServiceRef(CommonModule, CommonService);

        if ( request.url === '/api/sign/in' ) {
            const requestBody: IRequestBody = request.body;

            if ( !requestBody.sign || !requestBody.sign.clientData || !requestBody.sign.clientData.login || !requestBody.sign.clientData.password ||
                typeof requestBody.sign.clientData.login !== 'string' || typeof requestBody.sign.clientData.password !== 'string'
            ) throw new BadRequestException(`${ request.url } "ValidateClient - invalid sign client data"`);

            const clientLogin: string = requestBody.sign.clientData.login.trim();
            const clientPassword: string = requestBody.sign.clientData.password.trim();

            const validatedClientData: IAdmin | IUser = await this._clientSignDataValidate(commonServiceRef, request, clientLogin, clientPassword);

            this._setActiveClientData(request, validatedClientData);

            if ( token ) await this._jwtControlService.addRevokedToken(token);

            return true;
        } else if ( commonServiceRef ) {
            const validatedClientPayload: IJWTPayload | null = await this._jwtControlService.tokenValidate(request, token as string, throwError);
            const clientType: string | null = validatedClientPayload ? validatedClientPayload.type : null;
            const clientLogin: string | null = validatedClientPayload ? validatedClientPayload.login : null;

            const existingClientData: IAdmin[] | IUser[] | null = ( await commonServiceRef.getClients({ where: { login: clientLogin as string }}, 'Admin' || 'User') );

            if ( !existingClientData ) {
                if ( throwError ) throw new UnauthorizedException(`${ request.url } "ValidateClient - client instance does not exists, login - ${ validatedClientPayload ? validatedClientPayload.login : '-' }"`);
                else {
                    if ( request.activeClientData ) {
                        request.activeClientData.id = null;
                        request.activeClientData.login = null;
                        request.activeClientData.email = null;
                        request.activeClientData.type = 'guest';
                        request.activeClientData.tasks = null;
                    }

                    this._setActiveClientData(request);

                    return false;
                }
            }

            this._setActiveClientData(request, existingClientData[0]);

            return requiredClientTypes.some(requiredClientType => requiredClientType === clientType);
        }

        return true;
    }

    public async sign (request: IRequest, response: Response, operation: string, clientData: IClientSignData): Promise<string | void> {
        const commonServiceRef: CommonService = await this._appService.getServiceRef(CommonModule, CommonService);

        if ( operation === 'in' && request.activeClientData ) {
            const payload: IJWTPayload = {
                id: request.activeClientData.id,
                login: request.activeClientData.login,
                email: request.activeClientData.email,
                type: request.activeClientData.type as 'admin' | 'user' | 'guest',
                tasks: request.activeClientData.type === 'user' ? request.activeClientData.tasks : null,
                __secure_fgpHash: ""
            }
    
            const { __secure_fgp, __secure_fgpHash } = generate__secure_fgp();
    
            payload.__secure_fgpHash = __secure_fgpHash;
    
            await commonServiceRef.registerUserLastLoginTime(payload.login as string);
            await commonServiceRef.registerUserLastActivityTime(payload.login as string);
    
            const access_token: string = this._jwtService.sign(payload);
    
            await this._jwtControlService.saveToken(access_token);
    
            response.cookie('__secure_fgp', __secure_fgp, this._appService.cookieSerializeOptions);
    
            return access_token;
        } else if ( operation === 'up' ) {
            const { login, email, password } = clientData;

            await commonServiceRef.createUser({
                login: ( login as string ).trim(),
                password: password.trim(),
                email: email.trim(),
                type: 'user'
            });
        }
    }

    private async _clientSignDataValidate (commonServiceRef: CommonService, request: IRequest, clientLogin: string, clientPassword: string): Promise<IAdmin | IUser> {
        const clientInstance: IAdmin | IUser = ( await commonServiceRef.getClients({ where: { login: clientLogin }}, 'Admin' || 'User') )[0];

        console.log(await bcrypt.hash('12345Admin', parseInt(process.env['CLIENT_PASSWORD_BCRYPT_SALTROUNDS'] as string, 10)));

        if ( !clientInstance ) throw new UnauthorizedException(`${ request.url } "_clientSignDataValidate - client instance does not exists"`);



        console.log(clientPassword); 
        console.log(clientInstance.password);




        const passwordIsValid: boolean = await bcrypt.compare(clientPassword, clientInstance.password); 

        if ( !passwordIsValid ) throw new UnauthorizedException(`${ request.url } "_clientSignDataValidate - client password invalid"`);

        return clientInstance;
    }

    private _setActiveClientData (request: IRequest, clientData?: IAdmin | IUser): void {
        if ( request.activeClientData ) {
            request.activeClientData.id = clientData ? clientData.id : null;
            request.activeClientData.login = clientData ? clientData.login : null;
            request.activeClientData.email = clientData ? clientData.email : null;
            request.activeClientData.type = clientData ? clientData.type as 'admin' | 'user' : 'guest';
            request.activeClientData.tasks = clientData && clientData.type === 'user' ? ( clientData as IUser ).tasks : null;
        }
    }
}