import { BadRequestException, Body, Controller, Put, Req } from '@nestjs/common';

import { ClientService } from '../services/client.service';

import { IRequest, IRequestBody } from 'types/global';

@Controller('client')
export class ClientController {
    constructor (
        private readonly _clientService: ClientService
    ) { }

    @Put('/changeUserPassword')
    public async changeUserPassword (@Req() request: IRequest, @Body() requestBody: IRequestBody): Promise<void> {
        const loginPattern: RegExp = /^[a-zA-Z](.[a-zA-Z0-9_-]*)$/;
        const passwordPattern: RegExp = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}/g;

        if ( !requestBody || !requestBody.client || !requestBody.client.userLogin || !requestBody.client.userPassword
            || !loginPattern.test(requestBody.client.userLogin) || !passwordPattern.test(requestBody.client.userPassword)
        ) throw new BadRequestException(`${ request.url } "ChangeUserPassword - invalid request body data"`);

        return this._clientService.changeUserPassword(requestBody.client.userLogin, requestBody.client.userPassword);
    }
}