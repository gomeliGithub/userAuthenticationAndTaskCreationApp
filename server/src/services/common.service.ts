import { Injectable } from '@nestjs/common';

import { Admin, Prisma, User } from '@prisma/client';

import { ClientModule } from '../modules/client.module';

import { AppService } from '../app.service';
import { ClientService } from './client.service';

import { IGetUsersOptions } from 'types/options';

@Injectable()
export class CommonService {
    constructor (
        private readonly _appService: AppService
    ) { }

    public async getClients (options: IGetUsersOptions, clientType: 'Admin'): Promise<Admin[]>
    public async getClients (options: IGetUsersOptions, clientType: 'User'): Promise<User[]>
    public async getClients (options: IGetUsersOptions, clientType: 'Admin' | 'User'): Promise<Admin[] | User[]>
    public async getClients (options: IGetUsersOptions, clientType: 'Admin' | 'User'): Promise<Admin[] | User[]> {
        const clientServiceRef: ClientService = await this._appService.getServiceRef(ClientModule, ClientService);

        return clientServiceRef.getClients(options, clientType);
    }

    public async createUser (data: Prisma.UserCreateInput): Promise<User> {
        const clientServiceRef: ClientService = await this._appService.getServiceRef(ClientModule, ClientService);

        return clientServiceRef.createUser(data);
    }

    public async registerUserLastActivityTime (userLogin: string): Promise<void> {
        const clientServiceRef: ClientService = await this._appService.getServiceRef(ClientModule, ClientService);

        return clientServiceRef.registerUserLastActivityTime(userLogin);
    }

    public async registerUserLastLoginTime (userLogin: string): Promise<void> {
        const clientServiceRef: ClientService = await this._appService.getServiceRef(ClientModule, ClientService);

        return clientServiceRef.registerUserLastLoginTime(userLogin);
    }
}