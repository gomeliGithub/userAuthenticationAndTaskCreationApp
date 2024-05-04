import { Injectable } from '@nestjs/common';

import { CommonModule } from '../modules/common.module';

import { AppService } from '../app.service';
import { CommonService } from './common.service';

import { IGetUsersData, IRequest } from 'types/global';
import { IGetUsersOptionsData } from 'types/options';
import { IUser } from 'types/models';

@Injectable()
export class AdminDashboardService {
    constructor (
        private readonly _appService: AppService,
    ) { }
    // Функция для проверки доступа к странице администратора
    public async checkAccess (request: IRequest, __secure_fgp: string): Promise<boolean> {
        if ( !__secure_fgp || __secure_fgp === '' ) return false;

        const commonServiceRef: CommonService = await this._appService.getServiceRef(CommonModule, CommonService);

        const validateClientAuthResult: boolean = await commonServiceRef.validateClient(request, [ 'admin' ], false, commonServiceRef);

        return validateClientAuthResult;
    }
    // Функция для получения данных зарегистрированных пользователей
    public async getUsersData (request: IRequest, optionsData: IGetUsersOptionsData): Promise<IGetUsersData> {
        const commonServiceRef: CommonService = await this._appService.getServiceRef(CommonModule, CommonService);

        const commonUsersCount: number = await commonServiceRef.getClientsCommonCount('user');
        
        const usersData: IUser[] = await commonServiceRef.getClients({
            select: {
                id: true,
                login: true,
                email: true,
                password: false,
                tasks: true,
                lastActiveDate: false,
                lastSignInDate: false
            },
            where: { login: optionsData.login, email: optionsData.email }, 
            skip: optionsData.skip, take: optionsData.take
        }, 'user');

        return {
            users: usersData,
            moreUsersAreExists: commonUsersCount > optionsData.skip + usersData.length && commonUsersCount > optionsData.take
        };
    }
}