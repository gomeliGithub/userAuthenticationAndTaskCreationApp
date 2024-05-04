import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

import { WinstonService } from '../services/winston.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor (
        private readonly _winstonService: WinstonService
    ) { }
    // Логирование http ошибок
    catch (exception: HttpException, host: ArgumentsHost) {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();
        const status: number = exception.getStatus();
        const message: string = exception.message;

        this._winstonService.error(`${ process.env.SERVER_DOMAIN } [${ process.env.SERVER_API_PORT ?? process.env.PORT }] ${ status } - ${ message }`, '');

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url
        });
    }
}