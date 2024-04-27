import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JWT_tokens } from '@prisma/client';

import * as crypto from 'crypto';
import ms from 'ms';

import { PrismaService } from './prisma.service';

import { IRequest } from 'types/global';
import { IJWTPayload } from 'types/sign';

@Injectable()
export class JwtControlService {
    constructor (
        private readonly _prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }
    
    public extractTokenFromHeader (request: IRequest, throwError = true): string | undefined {
        const [ type, token ] = request.headers.authorization?.split(' ') ?? [];

        if ( request.url !== '/api/sign/up' && request.url !== '/api/sign/in' && request.url !== '/api/sign/getActiveClient' && request.url !== '/api/sign/out' && !token ) {
            if ( throwError ) throw new UnauthorizedException(`${ request.url } "ExtractTokenFromHeader - access token does not exists"`);
            else return undefined;
        }
        
        return type === 'Bearer' ? token : undefined;
    }

    public async tokenValidate (request: IRequest, token: string, throwError = true): Promise<IJWTPayload | null> {
        let validatedClientPayload: IJWTPayload | null = null;

        try {
            validatedClientPayload = await this.jwtService.verifyAsync<IJWTPayload>(token);
        } catch {
            if ( throwError ) throw new UnauthorizedException(`${ request.url } "TokenValidate - access token is invalid, token - ${ token }"`);
            else return null;
        }

        const client__secure_fgpHash: string = crypto.createHmac("SHA256", request.cookies['__secure_fgp']).digest('hex');

        if ( client__secure_fgpHash !== validatedClientPayload.__secure_fgpHash || !( await this._validateRevokedToken(token) ) ) {
            if ( throwError ) throw new UnauthorizedException(`${ request.url } "TokenValidate - secure fingerprint hash is invalid, token - ${ token }"`);
            else return null;
        }

        return validatedClientPayload;
    }

    public async addRevokedToken (token: string): Promise<void> {
        const revokedTokenInstance: JWT_tokens | null = await this._checkRevokedTokenIs(token); 

        if ( !revokedTokenInstance ) {
            const token_hash: string = crypto.createHmac("SHA256", token).digest('hex');

            await this._prisma.jWT_tokens.update({ where: { token_hash }, 
                data: { 
                    revokation_date: new Date(), 
                    revoked: true 
                } 
            });
        }
    }

    public async saveToken (token: string): Promise<void> {
        const token_hash: string = crypto.createHmac("SHA256", token).digest('hex');

        const expires_date: Date = new Date(Date.now() + ms(process.env['JWT_EXPIRESIN_TIME'] as string));

        await this._prisma.jWT_tokens.create({ 
            data: { 
                token_hash,
                expires_date,
                revokation_date: expires_date
            }
        });
    }

    private async _validateRevokedToken (token: string): Promise<boolean> {
        const revokedTokenInstance: JWT_tokens | null = await this._checkRevokedTokenIs(token);

        if ( revokedTokenInstance ) {
            if ( new Date() > revokedTokenInstance.revokation_date ) return false;
        }

        return true;
    }

    private async _checkRevokedTokenIs (token: string): Promise<JWT_tokens | null> {
        const token_hash: string = crypto.createHmac("SHA256", token).digest('hex');

        const revokedTokenData: JWT_tokens | null = await this._prisma.jWT_tokens.findFirst({ where: { token_hash, revoked: true } });

        return revokedTokenData;
    }
}