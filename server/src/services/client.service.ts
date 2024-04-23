import { BadRequestException, Injectable } from '@nestjs/common';

import { Admin, Prisma, User } from '@prisma/client';

import { PrismaService } from './prisma.service';

import { IGetAdminsOptions, IGetUsersOptions } from 'types/options';

@Injectable()
export class ClientService {
    constructor (
        private readonly _prisma: PrismaService
    ) { }

    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'Admin'): Promise<Admin[]>
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'User'): Promise<User[]>
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'Admin' | 'User'): Promise<Admin[] | User[]>
    public async getClients (options: IGetAdminsOptions | IGetUsersOptions, clientType: 'Admin' | 'User'): Promise<Admin[] | User[]> {
        let admins: Admin[] | null = [];
        let users: User[] | null = [];

        if ( clientType === 'Admin' ) {
            const { select, where, orderBy, cursor, skip, take } = options as IGetAdminsOptions;

            admins = await this._prisma.admin.findMany({
                select,
                where,
                orderBy,
                cursor,
                skip,
                take
            });
        } else if ( clientType === 'User' ) {
            const { select, where, orderBy, cursor, skip, take } = options as IGetUsersOptions;

            users = await this._prisma.user.findMany({
                select,
                where,
                orderBy,
                cursor,
                skip,
                take
            });
        }

        return admins.length !== 0 ? admins : users;
    }

    public async createUser (data: Prisma.UserCreateInput): Promise<User> {
        data.login = data.login.trim();
        data.email = data.email.trim();
        data.password.trim();

        data.type = 'user';

        const existingUser: User | null = await this._prisma.user.findUnique({ where: { login: data.login }});

        if ( existingUser ) throw new BadRequestException('CreateUser - user instance does exists');

        return this._prisma.user.create({
            data
        });
    }

    public async updateUser (userLogin: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this._prisma.user.update({
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