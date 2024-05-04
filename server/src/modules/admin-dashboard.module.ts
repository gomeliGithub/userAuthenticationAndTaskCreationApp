import { Module } from '@nestjs/common';

import { AdminDashboardController } from '../controllers/admin-dashboard.controller';

import { AppService } from '../app.service';
import { AdminDashboardService } from '../services/admin-dashboard.service';

@Module({
    providers: [ AppService, AdminDashboardService ],
    controllers: [AdminDashboardController],
    imports: [],
    exports: []
})
export class AdminDashboardModule {}