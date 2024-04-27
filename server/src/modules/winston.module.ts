import { Module } from '@nestjs/common';

import { WinstonService } from '../services/winston.service';

@Module({
    imports: [],
    providers: [WinstonService],
    exports: [WinstonService]
})
export class WinstonModule {}