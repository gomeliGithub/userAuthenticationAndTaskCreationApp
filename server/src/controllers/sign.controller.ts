import { BadRequestException, Body, Controller, Post, Req, Res } from '@nestjs/common';

import { Response } from 'express';

import { SignService } from '../services/sign.service';

import { ClientTypes } from '../decorators/client.types.decorator';

import { IRequest, IRequestBody } from 'types/global';

@Controller('sign')
export class SignController {
    constructor (private readonly _signService: SignService) { }

    @Post('/process')
    @ClientTypes('admin', 'user', 'guest')
    async sign (@Req() request: IRequest, @Body() requestBody: IRequestBody, @Res({ passthrough: true }) response: Response): Promise<string | void> {
        const loginPattern: RegExp = /^[a-zA-Z](.[a-zA-Z0-9_-]*)$/;
        const emailPattern: RegExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;

        if ( !requestBody.sign || !requestBody.sign.operation || !requestBody.sign.clientData 
            || !requestBody.sign.clientData.login && ( requestBody.sign.clientData.login && requestBody.sign.operation === 'up' && !loginPattern.test(requestBody.sign.clientData.login) )
            || !requestBody.sign.clientData.email || ( requestBody.sign.operation === 'up' && !emailPattern.test(requestBody.sign.clientData.email) )
            || !requestBody.sign.clientData.password || ( requestBody.sign.operation === 'up' && requestBody.sign.clientData.password.length < 5 )
        ) throw new BadRequestException();

        return this._signService.sign(request, response, requestBody.sign.operation, requestBody.sign.clientData);
    }
}