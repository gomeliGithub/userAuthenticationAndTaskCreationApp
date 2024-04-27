import { Prisma, Users, Tasks, JWT_tokens, Admins } from "@prisma/client";

export interface IAdmin extends Admins { }
export interface IUser extends Users, Prisma.UsersGetPayload<{ include: { tasks: true } }> { }
export interface ITask extends Tasks { }
export interface IJWT_token extends JWT_tokens { }