import { Injectable, OnModuleInit } from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'> implements OnModuleInit {
    constructor () {
        super({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'stdout',
                    level: 'error',
                },
                {
                    emit: 'stdout',
                    level: 'info',
                },
                {
                    emit: 'stdout',
                    level: 'warn',
                }
            ]
        });
    }
    // Подключение к БД
    async onModuleInit (): Promise<void> {
        this.$on('query', event => {
            console.log('Query: ' + event.query)
            console.log('Params: ' + event.params)
            console.log('Duration: ' + event.duration + 'ms')
        });
        
        await this.$connect();
    }
}