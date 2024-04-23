import { DynamicModule, Injectable, Type } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';

import ms from 'ms';

import { ClientModule } from './modules/client.module';
import { CommonModule } from './modules/common.module';

import { CommonService } from './services/common.service';
import { ClientService } from './services/client.service';
import { SignService } from './services/sign.service';
import { JwtControlService } from './services/jwt-control.service';

import { ICookieSerializeOptions } from 'types/global';

@Injectable()
export class AppService {
    constructor (
        private readonly _lazyModuleLoader: LazyModuleLoader
    ) { }

    public cookieSerializeOptions: ICookieSerializeOptions = {
        httpOnly: true,
        maxAge: ms(process.env['COOKIE_MAXAGE_TIME'] as string),
        sameSite: 'strict',
        secure: false,
        priority: 'high'
    }

    public async getServiceRef ( module: typeof ClientModule, service: typeof ClientService): Promise<ClientService>
    public async getServiceRef ( module: typeof ClientModule, service: typeof SignService): Promise<SignService>
    public async getServiceRef ( module: typeof ClientModule, service: typeof JwtControlService): Promise<JwtControlService>
    public async getServiceRef ( module: typeof CommonModule, service: typeof CommonService): Promise<CommonService>
    public async getServiceRef ( module: DynamicModule | Type<unknown>, service: string | symbol | Function | Type<any>): Promise<ClientService | CommonService | SignService | JwtControlService> {
        const moduleRef = await this._lazyModuleLoader.load(() => module);
        const serviceRef: CommonService | ClientService | SignService | JwtControlService = moduleRef.get(service);

        return serviceRef;
    }
}