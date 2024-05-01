import { BadRequestException, Injectable } from '@nestjs/common';

import { Prisma, Users } from '@prisma/client';

import { PrismaService } from './prisma.service';

import { IGetAdminsOptions, IGetUsersOptions } from 'types/options';
import { IAdmin, IUser } from 'types/models';

@Injectable()
export class ClientService {
    constructor (
        private readonly _prisma: PrismaService
    ) { }

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

    public async createUser (data: Prisma.UsersCreateInput): Promise<Users> {
        data.login = data.login.trim();
        data.email = data.email.trim();
        data.password.trim();

        data.type = 'user';

        const existingUser: Users | null = await this._prisma.users.findUnique({ where: { login: data.login }});

        if ( existingUser ) throw new BadRequestException('CreateUser - user instance does exists');

        return this._prisma.users.create({
            data
        });
    }

    public async updateUser (userLogin: string, data: Prisma.UsersUpdateInput): Promise<Users> {
        return this._prisma.users.update({
            where: { login: userLogin },
            data
        });
    }

    public async registerUserLastActivityTime (userLogin: string): Promise<void> {
        await this.updateUser(userLogin, { lastActiveDate: new Date() });
    }

    public async registerUserLastLoginTime (userLogin: string): Promise<void> {
        await this.updateUser(userLogin, { lastSignInDate: new Date() });
    }
}