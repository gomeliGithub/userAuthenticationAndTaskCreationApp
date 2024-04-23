import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit (): Promise<void> {
        // подключаемся к БД при инициализации модуля
        await this.$connect();
    }
}