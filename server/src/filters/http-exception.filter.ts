import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

import { WinstonService } from '../services/winston.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor (
        private readonly _winstonService: WinstonService
    ) { }

    catch (exception: HttpException, host: ArgumentsHost) {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();
        const status: number = exception.getStatus();
        const message: string = exception.message;

        this.appService.logLineAsync(`${ process.env.SERVER_DOMAIN } [${ process.env.SERVER_API_PORT }] ${ status } ${ message }`, true, 'http');

        const splittedMessage: string[] = message.split(' - ');

        const context: string = `${ process.env.SERVER_DOMAIN } [${ process.env.SERVER_API_PORT }] ${ status } - ${ splittedMessage[0] }`;
        const correctMessage: string = splittedMessage[1];

        this._winstonService.error(correctMessage, '', context);

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}