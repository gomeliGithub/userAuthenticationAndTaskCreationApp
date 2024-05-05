import { BadRequestException, Injectable } from '@nestjs/common';

import * as argon2 from "argon2";

import { Prisma, Users } from '@prisma/client';
import { PrismaService } from './prisma.service';

import { IGetAdminsOptions, IGetUsersOptions } from 'types/options';
import { IAdmin, ITask, IUser } from 'types/models';

@Injectable()
export class ClientService {
    constructor (
        private readonly _prisma: PrismaService
    ) { }
    // Функция для получения данных зарегистрированных администраторов и пользователей
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'admin'): Promise<IAdmin[]>
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'user'): Promise<IUser[]>
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'admin' | 'user'): Promise<IAdmin[] | IUser[]>
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'admin' | 'user'): Promise<IAdmin[] | IUser[]> {
        let admins: IAdmin[] | null = [];
        let users: IUser[] | null = [];

        if ( clientType === 'admin' ) {
            const { select, where, orderBy, cursor, skip, take } = options as IGetAdminsOptions;

            admins = await this._prisma.admins.findMany({
                select,
                where,
                orderBy,
                cursor,
                skip,
                take
            });
        } else if ( clientType === 'user' ) {
            const { select, where, orderBy, cursor, skip, take } = options as IGetUsersOptions;

            users = await this._prisma.users.findMany({
                select,
                where,
                orderBy,
                cursor,
                skip,
                take
            }) as IUser[];
        }

        return admins.length !== 0 ? admins : users;
    }
    // Функция для получения количества зарегистрированных администраторов и пользователей
    public async getClientsCommonCount (clientType: 'admin' | 'user'): Promise<number> {
        let commonCount: number = 0;

        if ( clientType === 'admin' ) commonCount = await this._prisma.admins.count();
        else if ( clientType === 'user' ) commonCount = await this._prisma.users.count();

        return commonCount;
    }
    // Функция для создания пользователя
    public async createUser (data: Prisma.UsersCreateInput): Promise<Users> {
        data.login = data.login.trim();
        data.email = data.email.trim();
        data.password = data.password.trim();

        data.type = 'user';

        const existingUser: Users | null = await this._prisma.users.findUnique({ where: { login: data.login }});

        if ( existingUser ) throw new BadRequestException('CreateUser - user instance does exists');

        return this._prisma.users.create({
            data
        });
    }
    // Функция для обновления данных пользователя
    public async updateUser (userLogin: string, data: Prisma.UsersUpdateInput): Promise<Users> {
        return this._prisma.users.update({
            where: { login: userLogin },
            data
        });
    }
    // Функция для создания 'задания' пользователя
    public async createUserTask (userLogin: string, data: Prisma.TasksCreateInput): Promise<void> {
        const newTask: ITask = await this._prisma.tasks.create({ 
            data
        });

        // this.updateUser(userLogin, { tasks: {
        //      connect: { id: newTask.id }
        // }});
    }
    // Функция для регистрации последних действий пользователя
    public async registerUserLastActivityTime (userLogin: string): Promise<void> {
        await this.updateUser(userLogin, { lastActiveDate: new Date() });
    }
    // Функция для регистрации последней авторизации пользователя в аккаунт
    public async registerUserLastLoginTime (userLogin: string): Promise<void> {
        await this.updateUser(userLogin, { lastSignInDate: new Date() });
    }
    // Функция для смены пароля пользователя
    public async changeUserPassword (userLogin: string, newPassword: string): Promise<void> {
        const passwordHash: string = await argon2.hash(newPassword.trim(), { secret: Buffer.from(process.env.ARGON2_SECRETCODE as string) });
        
        this.updateUser(userLogin, { password: passwordHash });
    }
}