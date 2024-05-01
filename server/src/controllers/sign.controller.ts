import { BadRequestException, Body, Controller, Get, Post, Put, Req, Res } from '@nestjs/common';

import { Response } from 'express';

import { SignService } from '../services/sign.service';

import { ClientTypes } from '../decorators/client.types.decorator';

import { IRequest, IRequestBody } from 'types/global';
import { IJWTPayload } from 'types/sign';

@Controller('sign')
export class SignController {
    constructor (private readonly _signService: SignService) { }

    @Post('/process')
    @ClientTypes('admin', 'user', 'guest')
    async sign (@Req() request: IRequest, @Body() requestBody: IRequestBody, @Res({ passthrough: true }) response: Response): Promise<string | void> {
        const loginPattern: RegExp = /^[a-zA-Z](.[a-zA-Z0-9_-]*)$/;
        const emailPattern: RegExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;
        const passwordPattern: RegExp = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}/g;

        if ( !requestBody.sign || !requestBody.sign.operation || !requestBody.sign.clientData 
            || !requestBody.sign.clientData.login && ( requestBody.sign.clientData.login && requestBody.sign.operation === 'up' && ( typeof requestBody.sign.clientData.login !== 'string' || !loginPattern.test(requestBody.sign.clientData.login) ) )
            || !requestBody.sign.clientData.email || typeof requestBody.sign.clientData.email !== 'string' || ( requestBody.sign.operation === 'up' && !emailPattern.test(requestBody.sign.clientData.email) )
            || !requestBody.sign.clientData.password || typeof requestBody.sign.clientData.password !== 'string' || ( requestBody.sign.operation === 'up' && !passwordPattern.test(requestBody.sign.clientData.password) )
        ) throw new BadRequestException(`${ request.url } "Sign - invalid sign client data"`);

        return this._signService.sign(request, response, requestBody.sign.operation, requestBody.sign.clientData);
    }

    @Put('/out')
    async signOut (@Req() request: IRequest): Promise<void> {
        return this._signService.signOut(request);
    }

    @Get('/getActiveClient')
    async getActiveClient (@Req() request: IRequest): Promise<IJWTPayload | null> {
        return this._signService.getActiveClient(request);
    }
}