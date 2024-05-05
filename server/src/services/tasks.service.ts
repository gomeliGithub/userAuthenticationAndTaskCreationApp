import { Injectable } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';

import * as crypto from 'crypto';

import { ClientService } from './client.service';

import { IUser } from 'types/models';

@Injectable()
export class TasksService {
    private readonly _usersData: IUser[] = [];

    private _moreUsersAreExists: boolean = true;

    private _skip: number = 0;
    private _take: number = 4;

    constructor (
        private readonly _clientService: ClientService
    ) { }
    // Инициализация cron 'задания'
    @Interval(10000)
    async handleCron() {
        await this._getNextUsersDataAndCreateUserTasks();
    }
    // Получения следующих данных пользователей и вызов функции для создания заданий для них
    private async _getNextUsersDataAndCreateUserTasks (): Promise<void> {
        const nextUsersData: IUser[] = await this._clientService.getClients({ skip: this._skip, take: this._take }, 'user');

        this._createUserTask(nextUsersData);
    }
    // Создание 'заданий' для пользователей
    private async _createUserTask (usersData: IUser[]): Promise<void> {
        const commonUsersCount: number = await this._clientService.getClientsCommonCount('user');

        for ( const userData of usersData ) {
            const newId: number = Date.now();

            await this._clientService.createUserTask(userData.login, {
                id: newId,
                title: crypto.randomBytes(20).toString("hex"),
                user: {
                    connect: { id: userData.id }
                }
            });
        }

        this._usersData.push(...usersData);

        this._skip = this._usersData.length;
        this._moreUsersAreExists = commonUsersCount > this._skip + usersData.length && commonUsersCount > this._take;
        
        if ( this._moreUsersAreExists ) {
            const nextUsersData: IUser[] = await this._clientService.getClients({ skip: this._skip, take: this._take }, 'user');

            this._createUserTask(nextUsersData);
        } else if ( commonUsersCount === this._usersData.length ) {
            this._usersData.splice(0);
            this._skip = 0;
            this._moreUsersAreExists = true;

            return;
        }
    }
}