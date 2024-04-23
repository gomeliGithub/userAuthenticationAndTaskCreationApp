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
    where?: Prisma.AdminWhereInput;
    orderBy?: Prisma.AdminOrderByWithRelationInput;
    cursor?: Prisma.AdminWhereUniqueInput;
}

export interface IGetUsersOptions extends ICommonGetOptions {
    select?: {
        id?: boolean,
        login?: boolean,
        email?: boolean,
        password?: boolean,
        tasks?: boolean
    };
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    cursor?: Prisma.UserWhereUniqueInput;
}