import { Injectable } from '@nestjs/common';

import { Prisma, Users } from '@prisma/client';

import { ClientModule } from '../modules/client.module';

import { AppService } from '../app.service';
import { ClientService } from './client.service';

import { IGetAdminsOptions, IGetUsersOptions } from 'types/options';
import { IAdmin, IUser } from 'types/models';

@Injectable()
export class CommonService {
    constructor (
        private readonly _appService: AppService
    ) { }

    public async getClients (options: IGetAdminsOptions, clientType: 'admin'): Promise<IAdmin[]>
    public async getClients (options: IGetUsersOptions, clientType: 'user'): Promise<IUser[]>
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'admin' | 'user'): Promise<IAdmin[] | IUser[]>
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'admin' | 'user'): Promise<IAdmin[] | IUser[]> {
        const clientServiceRef: ClientService = await this._appService.getServiceRef(ClientModule, ClientService);

        return clientServiceRef.getClients(options, clientType);
    }

    public async createUser (data: Prisma.UsersCreateInput): Promise<Users> {
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