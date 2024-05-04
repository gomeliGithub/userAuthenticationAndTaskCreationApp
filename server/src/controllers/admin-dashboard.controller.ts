import { Controller, Get, Query, Req } from '@nestjs/common';

import { ClientTypes } from '../decorators/client.types.decorator';
import { Cookies } from '../decorators/cookies.decorator';

import { AdminDashboardService } from '../services/admin-dashboard.service';

import { IGetUsersData, IRequest } from 'types/global';

@Controller('admin-dashboard')
export class AdminDashboardController {
    constructor (
        private readonly _adminDashboardService: AdminDashboardService
    ) { }
    // Ендпоинт для проверки доступа к странице администратора
    @Get('/checkAccess')
    public async checkAccess (@Req() request: IRequest, @Cookies('__secure_fgp') __secure_fgp: string): Promise<boolean> {
        return this._adminDashboardService.checkAccess(request, __secure_fgp);
    }
    // Ендпоинт для получения данных зарегистрированных пользователей
    @Get('/getUsersData')
    @ClientTypes('admin')
    public async getUsersData (@Req() request: IRequest,
        @Query('login') login: string,
        @Query('email') email: string,
        @Query('skipCount') skipCount: string,
        @Query('takeCount') takeCount: string
    ): Promise<IGetUsersData> {
        const skip: number = parseInt(skipCount, 10);
        const take: number = parseInt(takeCount, 10);

        return this._adminDashboardService.getUsersData(request, { login, email, skip, take });
    }
}