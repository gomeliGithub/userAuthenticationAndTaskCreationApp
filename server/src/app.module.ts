import { Module } from '@nestjs/common';
import { AngularUniversalModule } from '@nestjs/ng-universal';
import { ConfigModule } from '@nestjs/config';

import bootstrap from 'src/main.server';

import { join } from 'path';

import { ClientModule } from './modules/client.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        AngularUniversalModule.forRoot({
            bootstrap: bootstrap,
            viewsPath: join(process.cwd(), 'dist/userAuthenticationAndTaskCreationApp/browser'),
            inlineCriticalCss: false
        }),
        ConfigModule.forRoot({
            envFilePath: [ 'server/config/.env.development', 'server/config/.env.production' ],
            isGlobal: true
        }),
        ClientModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}