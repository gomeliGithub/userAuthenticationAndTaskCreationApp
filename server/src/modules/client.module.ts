import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { SignGuard } from '../guards/sign.guard';

import { PrismaModule } from './prisma.module';

import { SignController } from '../controllers/sign.controller';

import { AppService } from '../app.service';
import { ClientService } from '../services/client.service';
import { SignService } from '../services/sign.service';
import { JwtControlService } from '../services/jwt-control.service';

@Module({
    providers: [ AppService, ClientService, SignService, JwtControlService, JwtService, {
        provide: APP_GUARD,
        useClass: SignGuard,
    }],
    controllers: [SignController],
    imports: [PrismaModule],
    exports: [ ClientService, SignService, JwtControlService ]
})
export class ClientModule {}