import { Prisma } from "@prisma/client";

interface ICommonGetOptions {
    skip?: number;
    take?: number;
}

export interface IGetAdminsOptions extends ICommonGetOptions {
    select?: {
        id?: boolean,
        login?: boolean,
        email?: boolean,
        password?: boolean
    };
    where?: Prisma.AdminsWhereInput;
    orderBy?: Prisma.AdminsOrderByWithRelationInput;
    cursor?: Prisma.AdminsWhereUniqueInput;
}

export interface IGetUsersOptions extends ICommonGetOptions {
    select?: {
        id?: boolean,
        login?: boolean,
        email?: boolean,
        password?: boolean,
        type?: boolean,
        lastActiveDate?: boolean,
        lastSignInDate?: boolean,
        tasks?: boolean
    };
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput;
    cursor?: Prisma.UsersWhereUniqueInput;
}

export interface IGetUsersOptionsData {
    login: string;
    email: string;
    skip: number;
    take: number;
}