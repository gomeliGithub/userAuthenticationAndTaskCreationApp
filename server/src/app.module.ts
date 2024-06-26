import { Module } from '@nestjs/common';
import { AngularUniversalModule } from '@nestjs/ng-universal';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtSecretRequestType } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';
import { ScheduleModule } from '@nestjs/schedule';

import bootstrap from 'src/main.server';

import * as argon2 from "argon2";

import { join } from 'path';

import { TasksModule } from './modules/tasks.module';
import { PrismaModule } from './modules/prisma.module';
import { ClientModule } from './modules/client.module';
import { AdminDashboardModule } from './modules/admin-dashboard.module';
import { WinstonModule } from './modules/winston.module';
import { CommonModule } from './modules/common.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaService } from './services/prisma.service';
import { TasksService } from './services/tasks.service';

import { IAdmin } from 'types/models';

@Module({
    imports: [
        AngularUniversalModule.forRoot({
            bootstrap: bootstrap,
            viewsPath: join(process.cwd(), 'dist/userAuthenticationAndTaskCreationApp/browser'),
            inlineCriticalCss: false
        }),
        ConfigModule.forRoot({
            envFilePath: [ 'server/config/.env.development' ], // 'server/config/.env.production'
            isGlobal: true
        }),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRETCODE,
            signOptions: { 
                algorithm: process.env.JWT_SIGNVERIFAY_SIGNATURE_ALGORITHM as Algorithm,
                expiresIn: process.env.JWT_EXPIRESIN_TIME
            },
            verifyOptions: {
                algorithms: [ process.env.JWT_SIGNVERIFAY_SIGNATURE_ALGORITHM as Algorithm ]
            },
            secretOrKeyProvider: (requestType: JwtSecretRequestType) => {
                switch ( requestType ) {
                    case JwtSecretRequestType.SIGN: return process.env.JWT_SECRETCODE as string;
                    case JwtSecretRequestType.VERIFY: return process.env.JWT_SECRETCODE as string;
                }
            }
        }),
        ScheduleModule.forRoot(),
        TasksModule,
        PrismaModule,
        ClientModule,
        AdminDashboardModule,
        WinstonModule,
        CommonModule
    ],
    controllers: [AppController],
    providers: [ AppService, PrismaService, TasksService ]
})
export class AppModule {
    constructor (
        private readonly _prisma: PrismaService
    ) { 
        this._createOrUpdateMainAdmin();
    }

    private async _createOrUpdateMainAdmin (): Promise<void> {
        const existingAdmin: IAdmin = await this._prisma.admins.findUnique({ where: { id: 1 } }) as IAdmin;

        const newPassword: string = await argon2.hash('12345Admin', { secret: Buffer.from(process.env.ARGON2_SECRETCODE as string) });

        if ( !existingAdmin ) await this._prisma.admins.create({ 
                data: {
                    login: 'mainAdmin',
                    password: newPassword,
                    type: 'admin',
                    email: 'irina01041971@mail.ru'
                }
            });
        else await this._prisma.admins.update({ where: { id: 1 }, data: {
            password: newPassword
        }});
    }
}