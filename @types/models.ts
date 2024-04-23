import { Prisma, User, Task, JWT_token, Admin } from "@prisma/client";

export interface IAdmin extends Admin { }
export interface IUser extends User, Prisma.UserGetPayload<{ include: { tasks: true } }> { }
export interface ITask extends Task { }
export interface IJWT_token extends JWT_token { }