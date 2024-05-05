import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma.module';

import { TasksService } from '../services/tasks.service';
import { ClientService } from '../services/client.service';

@Module({
    providers: [ TasksService, ClientService ],
    imports: [PrismaModule]
})
export class TasksModule {}