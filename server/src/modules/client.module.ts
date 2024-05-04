import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { SignGuard } from '../guards/sign.guard';

import { SignController } from '../controllers/sign.controller';

import { AppService } from '../app.service';
import { ClientService } from '../services/client.service';
import { SignService } from '../services/sign.service';
import { JwtControlService } from '../services/jwt-control.service';
import { PrismaService } from '../services/prisma.service';

@Module({
    providers: [ AppService, ClientService, SignService, JwtControlService, PrismaService, JwtService, {
        provide: APP_GUARD,
        useClass: SignGuard,
    }],
    controllers: [SignController],
    imports: [],
    exports: [ ClientService, SignService, JwtControlService ]
})
export class ClientModule {}